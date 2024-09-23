import sqlite3
import csv

class HW2Q1_sql:

    def create_connection(self, path):
        connection = None
        try:
            connection = sqlite3.connect(path)
            connection.text_factory = str
            print("Connection established.")
        except sqlite3.Error as e:
            print("Error occurred: " + str(e))
        return connection

    def execute_query(self, connection, query):
        cursor = connection.cursor()
        try:
            if query == "":
                return "Query Blank"
            else:
                cursor.execute(query)
                connection.commit()
                return "Query executed successfully"
        except sqlite3.Error as e:
            return "Error occurred: " + str(e)

    def execute_many(self, connection, query, data):
        cursor = connection.cursor()
        try:
            if query == "":
                return "Query Blank"
            else:
                cursor.executemany(query, data)
                connection.commit()
                return "Query many executed successfully"
        except sqlite3.Error as e:
            return "Error occurred: " + str(e)

# Create an instance of HW2Q1_sql
db = HW2Q1_sql()

# Create the database connection
conn = db.create_connection("HW2Q1.db")

if conn is None:
    print("Database Creation Error")
else:
    # Correct SQL query to create the table
    step1 = """
        CREATE TABLE IF NOT EXISTS game_table (
            name TEXT PRIMARY KEY,
            category TEXT,
            playtime TEXT,
            playtime_num INTEGER,
            avg_rating REAL,
            num_ratings INTEGER,
            min_players INTEGER
        )
    """

    # Execute the query to create the table
    print(db.execute_query(conn, step1))

    # Read the CSV file and insert data into the table
    try:
        with open('popular_board_game.csv', 'r', newline='', encoding='utf-8') as games:
            dr = csv.reader(games)
            header = next(dr)  # Skip the header row
            rows = [tuple(row) for row in dr]  # Convert rows to tuples for insertion

        # Insert data into the table
        insert_query = """
            INSERT INTO game_table (name, category, playtime, playtime_num, avg_rating, num_ratings, min_players)
            VALUES (?,?,?,?,?,?,?)
        """
        print(db.execute_many(conn, insert_query, rows))

    except FileNotFoundError:
        print("CSV file not found.")
    except Exception as e:
        print(f"Error reading CSV file: {e}")

    finally:
        # Close the connection
        conn.close()

