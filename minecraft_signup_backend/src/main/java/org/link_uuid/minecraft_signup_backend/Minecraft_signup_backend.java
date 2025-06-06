package org.link_uuid.minecraft_signup_backend;

import java.io.IOException;

import org.bukkit.plugin.java.JavaPlugin;
import org.link_uuid.minecraft_signup_backend.command.RemoveIP;
import org.link_uuid.minecraft_signup_backend.command.addip;

public final class Minecraft_signup_backend extends JavaPlugin {
    private HttpServer server;
    private static Minecraft_signup_backend main;
    
    @Override
    public void onEnable() {
    main = this;
    InitializeDatabase.initializeDatabase(this);
    //Bukkit.getServer().getPluginManager().registerEvents(new playerjoin(this), this);
    getLogger().info("Plugin enabled!");
    if (!getDataFolder().exists()) {
        getDataFolder().mkdirs();
    }
    server = new HttpServer(8080, this); // Initialize the HTTP server on port 8080
    this.getCommand("addip").setExecutor(new addip(this));
    this.getCommand("removeip").setExecutor(new RemoveIP(this));
    try {
        server.start();
        getLogger().info("HTTP Server started on port 8080");
    } catch (IOException e) {
        e.printStackTrace();
    }

    }

    @Override
    public void onDisable() {
        // Plugin shutdown logic
    }
}
