// Databricks notebook source
// STARTER CODE - DO NOT EDIT THIS CELL
import org.apache.spark.sql.functions.desc
import org.apache.spark.sql.functions._
import org.apache.spark.sql.types._
import spark.implicits._
import org.apache.spark.sql.expressions.Window

// COMMAND ----------

// STARTER CODE - DO NOT EDIT THIS CELL
spark.conf.set("spark.sql.legacy.timeParserPolicy","LEGACY")

// COMMAND ----------

// STARTER CODE - DO NOT EDIT THIS CELL
val customSchema = StructType(Array(StructField("lpep_pickup_datetime", StringType, true), StructField("lpep_dropoff_datetime", StringType, true), StructField("PULocationID", IntegerType, true), StructField("DOLocationID", IntegerType, true), StructField("passenger_count", IntegerType, true), StructField("trip_distance", FloatType, true), StructField("fare_amount", FloatType, true), StructField("payment_type", IntegerType, true)))

// COMMAND ----------

// STARTER CODE - YOU CAN LOAD ANY FILE WITH A SIMILAR SYNTAX.
val df = spark.read
   .format("com.databricks.spark.csv")
   .option("header", "true") // Use first line of all files as header
   .option("nullValue", "null")
   .schema(customSchema)
   .load("/FileStore/tables/nyc_tripdata.csv") // the csv file which you want to work with
   .withColumn("pickup_datetime", from_unixtime(unix_timestamp(col("lpep_pickup_datetime"), "MM/dd/yyyy HH:mm")))
   .withColumn("dropoff_datetime", from_unixtime(unix_timestamp(col("lpep_dropoff_datetime"), "MM/dd/yyyy HH:mm")))
   .drop($"lpep_pickup_datetime")
   .drop($"lpep_dropoff_datetime")

// COMMAND ----------

// LOAD THE "taxi_zone_lookup.csv" FILE SIMILARLY AS ABOVE. CAST ANY COLUMN TO APPROPRIATE DATA TYPE IF NECESSARY.

// ENTER THE CODE BELOW

val zone_df = spark.read
   .format("com.databricks.spark.csv")
   .option("header", "true") // Use first line of all files as header
   .option("nullValue", "null")
   .load("/FileStore/tables/taxi_zone_lookup.csv") // the csv file which you want to work with
   .withColumn("LocationID", col("LocationID").cast(IntegerType))

zone_df.show()

// COMMAND ----------

// STARTER CODE - DO NOT EDIT THIS CELL
// Some commands that you can use to see your dataframes and results of the operations. You can comment the df.show(5) and uncomment display(df) to see the data differently. You will find these two functions useful in reporting your results.
// display(df)
df.show(5) // view the first 5 rows of the dataframe

// COMMAND ----------

// STARTER CODE - DO NOT EDIT THIS CELL
// Filter the data to only keep the rows where "PULocationID" and the "DOLocationID" are different and the "trip_distance" is strictly greater than 2.0 (>2.0).

// VERY VERY IMPORTANT: ALL THE SUBSEQUENT OPERATIONS MUST BE PERFORMED ON THIS FILTERED DATA

val df_filter = df.filter($"PULocationID" =!= $"DOLocationID" && $"trip_distance" > 2.0)

df_filter.show(5)

// COMMAND ----------

// PART 1a: List the top-5 most popular locations for dropoff based on "DOLocationID", sorted in descending order by popularity. If there is a tie, then the one with the lower "DOLocationID" gets listed first

// Output Schema: DOLocationID int, number_of_dropoffs int 

// Hint: Checkout the groupBy(), orderBy() and count() functions.

// ENTER THE CODE BELOW

val DOpop_df = df_filter.groupBy($"DOLocationID")
  .agg(count($"DOLocationID")
  .alias("number_of_dropoffs"))
  .orderBy(desc("number_of_dropoffs"), asc("DOLocationID"))
  .limit(5)

DOpop_df.show()



// COMMAND ----------

// PART 1b: List the top-5 most popular locations for pickup based on "PULocationID", sorted in descending order by popularity. If there is a tie, then the one with the lower "PULocationID" gets listed first.
 
// Output Schema: PULocationID int, number_of_pickups int

// Hint: Code is very similar to part 1a above.

// ENTER THE CODE BELOW

val PUpop_df = df_filter.groupBy($"PULocationID")
  .agg(count($"PULocationID")
  .alias("number_of_pickups"))
  .orderBy(desc("number_of_pickups"), asc("puLocationID"))
  .limit(5)

PUpop_df.show()


// COMMAND ----------

// PART 2: List the top-3 locationID’s with the maximum overall activity. Here, overall activity at a LocationID is simply the sum of all pickups and all dropoffs at that LocationID. In case of a tie, the lower LocationID gets listed first.

//Note: If a taxi picked up 3 passengers at once, we count it as 1 pickup and not 3 pickups.

// Output Schema: LocationID int, total_activity int

// Hint: In order to get the sum of the number of pickups and dropoffs on each location, you may need to perform a join operation between the two dataframes that you created in earlier parts of this notebook. 


// ENTER THE CODE BELOW

val DO_count = df_filter.withColumnRenamed("DOLocationID", "LocationID")
  .groupBy($"LocationID")
  .agg(count("LocationID")
  .alias("number_of_dropoffs"))

val PU_count = df_filter.withColumnRenamed("PULocationID", "LocationID")
  .groupBy($"LocationID")
  .agg(count("LocationID")
  .alias("number_of_pickups"))

val joined_count = DO_count.join(PU_count, Seq("LocationID"), "outer")
  .withColumn("total_activity", ($"number_of_dropoffs") + ($"number_of_pickups"))
  .drop($"number_of_dropoffs")
  .drop($"number_of_pickups")
  .orderBy(desc("total_activity"), asc("LocationID"))

val joined_count_limit =joined_count.limit(3)

joined_count_limit.show()

// COMMAND ----------

// PART 3: List all the boroughs (of NYC: Manhattan, Brooklyn, Queens, Staten Island, Bronx along with "Unknown" and "EWR") and their total number of activities, in descending order of total number of activities. Here, the total number of activities for a borough (e.g., Queens) is the sum of the overall activities (as defined in part 2) of all the LocationIDs that fall in that borough (Queens). 

// Output Schema: Borough string, total_number_activities int

// Hint: You can use the dataframe obtained from the previous part, and will need to do the join with the 'taxi_zone_lookup' dataframe. Also, checkout the "agg" function applied to a grouped dataframe.

// ENTER THE CODE BELOW

val zone_bo = zone_df.select(
  "LocationID",
  "Borough")

val zone_bo2 = zone_bo.join(joined_count, Seq("LocationID"), "outer")
  .groupBy($"Borough")
  .agg(sum("total_activity").alias("total_number_activities"))
  .orderBy(desc("total_number_activities"))

zone_bo2.show()

// COMMAND ----------

// PART 4: List the top 2 days of week with the largest number of daily average pickups, along with the average number of pickups on each of the 2 days in descending order (no rounding off required). Here, the average pickup is calculated by taking an average of the number of pick-ups on different dates falling on the same day of the week. For example, 02/01/2021, 02/08/2021 and 02/15/2021 are all Mondays, so the average pick-ups for these is the sum of the pickups on each date divided by 3.

//Note: The day of week is a string of the day’s full spelling, e.g., "Monday" instead of the		number 1 or "Mon". Also, the pickup_datetime is in the format: yyyy-mm-dd.

// Output Schema: day_of_week string, avg_count float

// Hint: You may need to group by the "date" (without time stamp - time in the day) first. Checkout "to_date" function.

// ENTER THE CODE BELOW

val grouped_date = df_filter.withColumn("PUDate", to_date($"pickup_datetime"))
  .groupBy($"PUDate")
  .agg(count("*") as "date_count")

val day_df = grouped_date.withColumn("day_of_week", date_format($"PUDate", "EEEE"))
  .groupBy($"day_of_week")
  .agg(count("*"), sum("date_count"))
  .withColumn("avg_count", $"sum(date_count)" / $"count(1)")
  .drop("sum(date_count)" , "count(1)")
  .orderBy(desc("avg_count"))
  .limit(2)

day_df.show()
// val hold = grouped_date.select("date_count", "pickup_datetime")
// hold.show()


// val grouped_day = day_df.groupBy("day_of_week").agg(count("day_of_week"))
// day_df.select("day_of_week").show()

// COMMAND ----------

// PART 5: For each hour of a day (0 to 23, 0 being midnight) - in the order from 0 to 23(inclusively), find the zone in the Brooklyn borough with the LARGEST number of total pickups. 

//Note: All dates for each hour should be included.

// Output Schema: hour_of_day int, zone string, max_count int

// Hint: You may need to use "Window" over hour of day, along with "group by" to find the MAXIMUM count of pickups

// ENTER THE CODE BELOW

val PUHour = df_filter//.withColumn("hour_of_day", to_date($"pickup_datetime"))
  .withColumn("hour_of_day", date_format(($"pickup_datetime"), "H").cast(IntegerType) )
  .withColumn("LocationID", $"PULocationID")
  .select(
    "LocationID",
    "hour_of_day"
  )
  .join(zone_df, Seq("LocationID"), "left")
  .filter($"Borough"==="Brooklyn")
  .groupBy("Zone", "hour_of_day")
  .agg(count("*").alias("max_count"))

val window = Window.partitionBy("hour_of_day").orderBy(desc("max_count"))

val ranked = PUHour.withColumn("hour_rank", rank().over(window))
  .filter($"hour_rank" ==="1")
  .select($"hour_of_day",
  $"Zone",
  $"max_count")
  .orderBy(asc("hour_of_day"))
ranked.show(24)

// COMMAND ----------

// PART 6 - Find which 3 different days in the month of January, in Manhattan, saw the largest positive percentage increase in pick-ups compared to the previous day, in the order from largest percentage increase to smallest percentage increase 

// Note: All years need to be aggregated to calculate the pickups for a specific day of January. The change from Dec 31 to Jan 1 can be excluded.

// Output Schema: day int, percent_change float


// Hint: You might need to use lag function, over a window ordered by day of month.

// ENTER THE CODE BELOW

val df_jan = df_filter.withColumn("month" , date_format(($"pickup_datetime"), "M").cast(IntegerType))
  .withColumn("day" , date_format(($"pickup_datetime"), "d").cast(IntegerType))
  .filter($"month" === 1)
  .select(
    $"day",
    $"PULocationID" as "LocationID"
  )
    .join(zone_df, Seq("LocationID"))
    .filter($"Borough" === "Manhattan")
    .groupBy("day")
    .agg(count("*") as "count")

val window_day = Window.orderBy("day")

val both_days = df_jan.withColumn("prev_day", lag($"count",1).over(window_day))
  .withColumn("percent_change", round((($"count" - $"prev_day") / $"prev_day") *100,2))
  .select($"day", $"percent_change")
  .orderBy(desc("percent_change"))
  .limit(3)

both_days.show()
// val hold = df_filter.withColumn("year" , date_format(($"pickup_datetime"), "y").cast(IntegerType))
//   .groupBy("year")
//   .agg(count("*"))
// hold.show()
