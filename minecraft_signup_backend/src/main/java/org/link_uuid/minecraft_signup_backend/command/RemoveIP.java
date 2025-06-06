package org.link_uuid.minecraft_signup_backend.command;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.link_uuid.minecraft_signup_backend.Minecraft_signup_backend;

public class RemoveIP implements CommandExecutor{


    private final String databaseUrl = "jdbc:sqlite:plugins/minecraft_signup_backend/data.db";
    
    private final Minecraft_signup_backend plugin;

    // Constructor to accept the plugin instance
    public RemoveIP(Minecraft_signup_backend plugin) {
        this.plugin = plugin;
    }
    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length < 1) {
            System.err.println("Usage: /removeip <ip>");
            return false;
        }
        String ipAddress = args[0];

        // Process the IP address (e.g., save it to a database or whitelist)
        System.out.println("IP Address added: " + ipAddress);

        try (Connection conn = DriverManager.getConnection(databaseUrl)) {
            String deleteSQL = "DELETE FROM admin_ip WHERE avaliable_ip = ?";
            PreparedStatement stmt = conn.prepareStatement(deleteSQL);
            stmt.setString(1, ipAddress);
            stmt.executeUpdate();

            System.out.println("IP Address removed from the database: " + ipAddress);
        } catch (SQLException e) {
            e.printStackTrace();
            System.out.println("IP Address not found");
            return false;
        }

        // Return true to indicate the command was handled successfully
        return false;
    }
    
}
