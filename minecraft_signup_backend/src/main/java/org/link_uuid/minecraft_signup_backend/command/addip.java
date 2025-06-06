package org.link_uuid.minecraft_signup_backend.command;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.link_uuid.minecraft_signup_backend.Minecraft_signup_backend;

public class addip implements CommandExecutor{


    private final String databaseUrl = "jdbc:sqlite:plugins/minecraft_signup_backend/data.db";
    
    private final Minecraft_signup_backend plugin;

    // Constructor to accept the plugin instance
    public addip(Minecraft_signup_backend plugin) {
        this.plugin = plugin;
    }
    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof org.bukkit.command.ConsoleCommandSender)) {
            System.err.println("this command cannot be execute on the player");
            return false;
        }
        if (args.length < 2) {
            System.err.println("Usage: /addIP <ip> <passcode>");
            return false;
        }
        String ipAddress = args[0];
        String passcode = args[1];

        // Process the IP address (e.g., save it to a database or whitelist)
        System.out.println("IP Address added: " + ipAddress);

        try (Connection conn = DriverManager.getConnection(databaseUrl)) {
            String insertSQL = "INSERT INTO admin_ip (passcode, avaliable_ip) VALUES (?, ?)";
            PreparedStatement stmt = conn.prepareStatement(insertSQL);
            stmt.setString(1, passcode);
            stmt.setString(2, ipAddress);
            stmt.executeUpdate();

            sender.sendMessage("IP Address added to the database: " + ipAddress);
        } catch (SQLException e) {
            e.printStackTrace();
            sender.sendMessage("Failed to add IP address to the database.");
            return false;
        }

        // Return true to indicate the command was handled successfully
        return false;
    }
    
}
