package org.link_uuid.minecraft_signup_backend;
import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

import org.bukkit.plugin.java.JavaPlugin;

public class InitializeDatabase {
    private static String DATABASE_URL;

    public static void initializeDatabase(JavaPlugin plugin) {
        try {
            // Get the plugin's data folder
            File dataFolder = plugin.getDataFolder();
            if (!dataFolder.exists()) {
                dataFolder.mkdirs(); // Create the folder if it doesn't exist
            }

            // Set the database file path inside the data folder
            File databaseFile = new File(dataFolder, "data.db");
            DATABASE_URL = "jdbc:sqlite:" + databaseFile.getAbsolutePath();

            // Initialize the database
            try (Connection conn = DriverManager.getConnection(DATABASE_URL)) {
                String createTableSQL = "CREATE TABLE IF NOT EXISTS players ("
                        + "id INTEGER PRIMARY KEY AUTOINCREMENT, "
                        + "discord_username TEXT NOT NULL, "
                        + "discord_id TEXT NOT NULL, "
                        + "avatar_url TEXT NOT NULL, "
                        + "groups TEXT, "
                        + "minecraft_player TEXT NOT NULL, "
                        + "minecraft_player_uuid TEXT NOT NULL)";
                Statement stmt = conn.createStatement();
                stmt.execute(createTableSQL);

                 //stmt.execute("DELETE FROM sqlite_sequence WHERE name='players'");
                //stmt.execute("INSERT INTO sqlite_sequence (name, seq) VALUES ('players', -1)");
            }
            try (Connection conn = DriverManager.getConnection(DATABASE_URL)) {
                String createTableSQL = "CREATE TABLE IF NOT EXISTS admin_ip ("
                        + "id INTEGER PRIMARY KEY AUTOINCREMENT, "
                        + "passcode TEXT NOT NULL, "
                        + "avaliable_ip TEXT NOT NULL)";
                Statement stmt2 = conn.createStatement();
                stmt2.execute(createTableSQL);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
        public static String getDatabaseUrl() {
        return DATABASE_URL;
    }

}
