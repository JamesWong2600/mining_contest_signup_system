package org.link_uuid.minecraft_signup_backend.Lan_detection;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class Lan_detection {

    private static final String DATABASE_URL = "jdbc:sqlite:plugins/minecraft_signup_backend/data.db";

    public static boolean isLanConnection(String ipAddress) {
        String query = "SELECT id, avaliable_ip FROM admin_ip"; // Replace with your table and column names
        Boolean LAN = false;
        try (Connection conn = DriverManager.getConnection(DATABASE_URL);
                PreparedStatement stmt = conn.prepareStatement(query);
                ResultSet rs = stmt.executeQuery()) {

            // Process the result set
            while (rs.next()) {
                int id = rs.getInt("id");
                String IP = rs.getString("avaliable_ip");
                if (ipAddress.startsWith(IP)) { // Loopback
                    System.out.println("Loopback detected for IP: " + ipAddress);
                    LAN = true; 
                }             
                System.out.println("ID: " + id + ", IP Address: " + ipAddress);
            }

        } catch (SQLException e) {
            e.printStackTrace();
            System.err.println("Failed to fetch data from the database.");
        }
        return LAN;
    }

    public static boolean isInRange(String ipAddress, int start, int end) {
        try {
            String[] parts = ipAddress.split("\\.");
            int secondOctet = Integer.parseInt(parts[1]);
            return secondOctet >= start && secondOctet <= end;
        } catch (NumberFormatException | ArrayIndexOutOfBoundsException e) {
            return false; // Invalid IP format
        }
    }
}
