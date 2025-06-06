package org.link_uuid.minecraft_signup_backend;

import java.io.File;
import java.io.IOException;

import javax.net.ssl.SSLServerSocketFactory;

import fi.iki.elonen.NanoHTTPD;

/**
 * NanoHTTPD HTTPS server for Minecraft plugin
 */
public class Https extends NanoHTTPD {
    private final Minecraft_signup_backend plugin;

    public Https(int port, Minecraft_signup_backend plugin) throws IOException {
        super(port);
        this.plugin = plugin;

        // Path to keystore inside the plugin's folder
        File keystoreFile = new File(plugin.getDataFolder(), "keystore.jks");

        if (!keystoreFile.exists()) {
            plugin.getLogger().severe("Keystore file not found: " + keystoreFile.getAbsolutePath());
            System.out.println("Keystore file not found: " + keystoreFile.getAbsolutePath());
            return;
        }

        try {
            // Enable HTTPS using SSLServerSocketFactory
            SSLServerSocketFactory sslFactory = makeSSLSocketFactory(
                    keystoreFile.getAbsolutePath(),
                    "password".toCharArray() // ← Replace with your password
            );
            makeSecure(sslFactory, null);
            plugin.getLogger().info("HTTPS is enabled on port " + port);
            System.out.println("HTTPS is enabled on port " + port);
        } catch (Exception e) {
            plugin.getLogger().severe("Failed to enable HTTPS: " + e.getMessage());
             System.out.println("Failed to enable HTTPS: " + e.getMessage());
        }
    }

    @Override
    public Response serve(IHTTPSession session) {
        String uri = session.getUri();
        Method method = session.getMethod();
        plugin.getLogger().info("Received " + method + " request for " + uri);
        System.out.println("Received " + method + " request for " + uri);

        return newFixedLengthResponse(Response.Status.OK, "text/plain", "Hello from HTTPS NanoHTTPD!");
    }
}
