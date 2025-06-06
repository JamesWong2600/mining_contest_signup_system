package org.link_uuid.minecraft_signup_backend;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.bukkit.Bukkit;
import org.bukkit.OfflinePlayer;
import org.bukkit.plugin.java.JavaPlugin;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import fi.iki.elonen.NanoHTTPD;

public class HttpServer extends NanoHTTPD {
     private final Gson gson = new Gson();
     private final String databaseUrl;


    public HttpServer(int port, JavaPlugin plugin) {
        super(port);
        this.databaseUrl = InitializeDatabase.getDatabaseUrl(); // Get the database URL from InitializeDatabase
    }

    @Override
    public NanoHTTPD.Response serve(IHTTPSession session) {
        String uri = session.getUri();
        NanoHTTPD.Response response = newFixedLengthResponse(Response.Status.NOT_FOUND, "application/json", "{\"error\":\"Unknown endpoint\"}"); // Default response

        String userIpAddress;
        //String userAgent = session.getHeaders().get("user-agent");
        boolean PermittedUser = false;
        String query = "SELECT id, avaliable_ip FROM admin_ip"; 

        //boolean isLan = Lan_detection.isLanConnection(userIpAddress);
        //System.out.println("Is LAN Connection: " + isLan);

        //System.out.println("User Agent: " + userAgent);
        //System.out.println("User IP Address: " + userIpAddress);
        if (uri.equals("/register")) {
            Map<String, String> files = new HashMap<>();
            try {
                session.parseBody(files); // Parse the request body
            } catch (IOException | NanoHTTPD.ResponseException e) {
                e.printStackTrace();
                response = newFixedLengthResponse(Response.Status.INTERNAL_ERROR, "application/json", "{\"error\":\"Failed to parse request body\"}");
                return response; // Return the response immediately
            }

            String requestBody = files.get("postData");
            if (requestBody == null) {
                response = newFixedLengthResponse(Response.Status.BAD_REQUEST, "application/json", "{\"error\":\"Missing request body\"}");
                return response; // Return the response immediately
            }

            // Parse JSON from the request body
            JsonObject json = gson.fromJson(requestBody, JsonObject.class);
            String discordUsername = json.get("discord_username").getAsString();
            String discordId = json.get("discord_id").getAsString();
            String minecraftPlayerName = json.get("minecraft_player").getAsString();
            String avatar_url = json.get("avatar_url").getAsString();
            String groups = "0";
            System.out.println("Received registration request: " + discordUsername + ", " + discordId + ", " + minecraftPlayerName + ", " + avatar_url);

            // Validate the input
            if (discordUsername == null || discordId == null || minecraftPlayerName == null) {
                response = newFixedLengthResponse(Response.Status.BAD_REQUEST, "application/json", "{\"error\":\"Missing required parameters\"}");
                return response; // Return the response immediately
            }

            UUID minecraftPlayerUUID = getOnlinePlayerUUID(minecraftPlayerName);
            if (minecraftPlayerUUID == null) {
                response = newFixedLengthResponse(Response.Status.BAD_REQUEST, "application/json", "{\"error\":\"Player is not online or does not exist\"}");
                return response; // Return the response immediately
            }

            try (Connection conn = DriverManager.getConnection(databaseUrl)) {
                String insertSQL = "INSERT INTO players (discord_username, discord_id, avatar_url, groups, minecraft_player, minecraft_player_uuid) VALUES (?, ?, ?, ?, ?, ?)";
                PreparedStatement stmt = conn.prepareStatement(insertSQL);
                stmt.setString(1, discordUsername);
                stmt.setString(2, discordId);
                stmt.setString(3, avatar_url);
                stmt.setString(4, groups);
                stmt.setString(5, minecraftPlayerName);
                stmt.setString(6, minecraftPlayerUUID.toString());
                stmt.executeUpdate();
            } catch (SQLException e) {
                e.printStackTrace();
                response = newFixedLengthResponse(Response.Status.INTERNAL_ERROR, "application/json", "{\"error\":\"Failed to save data to the database\"}");
                return response; // Return the response immediately
            }

            // Process the data (e.g., save to database)
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("status", "success");
            responseData.put("message", "Player registered successfully");
            responseData.put("discord_username", discordUsername);
            responseData.put("discord_id", discordId);
            responseData.put("avatar_url", avatar_url);
            responseData.put("groups", groups);
            responseData.put("minecraft_player", minecraftPlayerName);
            responseData.put("minecraft_player_uuid", minecraftPlayerUUID);

            // Convert the response object to JSON
            String jsonResponse = gson.toJson(responseData);

            // Return the JSON response
            response = newFixedLengthResponse(Response.Status.OK, "application/json", jsonResponse);
    } else if (uri.equals("/get_all_players")) {
        //System.out.println("connected");
        try (Connection conn = DriverManager.getConnection(databaseUrl)) {
            String selectSQL = "SELECT discord_username, discord_id, avatar_url, groups, minecraft_player, minecraft_player_uuid FROM players";
            PreparedStatement stmt = conn.prepareStatement(selectSQL);

            ResultSet rs = stmt.executeQuery();
            // Create a list to store all player records
            List<Map<String, Object>> players = new ArrayList<>();

            userIpAddress = getPublicIP(session);
            //userAgent = session.getHeaders().get("user-agent");

            while (rs.next()) {
                // Retrieve data from the ResultSet
                Map<String, Object> player = new HashMap<>();
                player.put("discord_username", rs.getString("discord_username"));
                player.put("discord_id", rs.getString("discord_id"));
                player.put("avatar_url", rs.getString("avatar_url"));
                player.put("groups", rs.getString("groups"));
                player.put("minecraft_player", rs.getString("minecraft_player"));
                player.put("minecraft_player_uuid", rs.getString("minecraft_player_uuid"));
                // Add the player record to the list
                players.add(player);
            }
            
            try (Connection conn2 = DriverManager.getConnection(databaseUrl);
            PreparedStatement stmt2 = conn2.prepareStatement(query);
            ResultSet rs2 = stmt2.executeQuery()) {

            // Process the result set
            while (rs2.next()) {
                //int id = rs.getInt("id");
                String IP = rs2.getString("avaliable_ip");
                if (userIpAddress.equals(IP)) { // Loopback
                    //System.out.println("Loopback detected for IP: " + userIpAddress);
                    PermittedUser = true; 
                }             
            }

           } catch (SQLException e) {
            e.printStackTrace();
               System.err.println("Failed to fetch data from the database.");
            }

            Map<String, Object> responseData = new HashMap<>();
            System.out.println("User IP Address: " + userIpAddress);
           // System.out.println("PermittedUser: " + PermittedUser);
            responseData.put("PermittedUser", PermittedUser);
            responseData.put("players", players);

            // Convert the list of players to JSON
            String jsonResponse = gson.toJson(responseData);

            // Return the JSON response
            response = newFixedLengthResponse(Response.Status.OK, "application/json", jsonResponse);
        } catch (SQLException e) {
            e.printStackTrace();
            return newFixedLengthResponse(Response.Status.INTERNAL_ERROR, "application/json", "{\"error\":\"Failed to retrieve data from the database\"}");
        }
    } else if (uri.equals("/edit_save")) {
            Map<String, String> files = new HashMap<>();
            try {
                session.parseBody(files); // Parse the request body
            } catch (IOException | NanoHTTPD.ResponseException e) {
                e.printStackTrace();
                response = newFixedLengthResponse(Response.Status.INTERNAL_ERROR, "application/json", "{\"error\":\"Failed to parse request body\"}");
                return response;
            }

            String requestBody = files.get("postData");
            if (requestBody == null) {
                response = newFixedLengthResponse(Response.Status.BAD_REQUEST, "application/json", "{\"error\":\"Missing request body\"}");
                return response;
            }

            // Parse JSON from the request body
            JsonObject json = gson.fromJson(requestBody, JsonObject.class);
            String minecraft_player = json.get("minecraft_player").getAsString();
            String groups = json.get("groups").getAsString();
            int index = json.get("index").getAsInt();

            System.out.println("Received registration request: " +  index+", "+minecraft_player + ", " + groups);

            UUID minecraftPlayerUUID = getOnlinePlayerUUID(minecraft_player);
            if (minecraftPlayerUUID == null) {
                response = newFixedLengthResponse(Response.Status.BAD_REQUEST, "application/json", "{\"error\":\"Player is not online or does not exist\"}");
                return response; // Return the response immediately
            }

            try (Connection conn = DriverManager.getConnection(databaseUrl)) {
            String updateSQL = "UPDATE players SET groups = ?, minecraft_player = ?, minecraft_player_uuid = ? WHERE id = ?";
            PreparedStatement stmt = conn.prepareStatement(updateSQL);
            stmt.setString(1, groups); // Set the group value
            stmt.setString(2, minecraft_player); // Set the username value
            stmt.setString(3, minecraftPlayerUUID.toString()); // Set the username value
            stmt.setInt(4, index+1);
            stmt.executeUpdate();
            // If the update is successful, return a success response
            System.out.println("Player data updated successfully for index: " + index);

            response = newFixedLengthResponse(Response.Status.OK, "application/json", "{\"status\":\"success\", \"message\":\"Player data updated successfully\"}");
        } catch (SQLException e) {
            e.printStackTrace();
            response = newFixedLengthResponse(Response.Status.INTERNAL_ERROR, "application/json", "{\"error\":\"Failed to update data in the database\"}");
        }

            //response = newFixedLengthResponse(Response.Status.OK, "application/json", "{\"status\":\"success\", \"message\":\"Player data updated successfully\"}");
    } else if (uri.equals("/check_auth")) {
            Map<String, String> files = new HashMap<>();
            try {
                session.parseBody(files); // Parse the request body
            } catch (IOException | NanoHTTPD.ResponseException e) {
                e.printStackTrace();
                response = newFixedLengthResponse(Response.Status.INTERNAL_ERROR, "application/json", "{\"error\":\"Failed to parse request body\"}");
                response.addHeader("Access-Control-Allow-Origin", "*");
                response.addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                response.addHeader("Access-Control-Allow-Headers", "Content-Type");
                return response;
            }

            String requestBody = files.get("postData");
            if (requestBody == null) {
                response = newFixedLengthResponse(Response.Status.BAD_REQUEST, "application/json", "{\"error\":\"Missing request body\"}");
                response.addHeader("Access-Control-Allow-Origin", "*");
                response.addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                response.addHeader("Access-Control-Allow-Headers", "Content-Type");
                return response;
            }

            boolean isAuthorized = false;
            // Parse JSON from the request body
            JsonObject json = gson.fromJson(requestBody, JsonObject.class);
            String passcode_input = json.get("passcode").getAsString();
            System.out.println("Received passcode: " + passcode_input);
            //Map<String, String> params = session.getParms();
            //String passcode_input = params.get("passcode");
            String IP = getPublicIP(session);
            try (Connection conn = DriverManager.getConnection(databaseUrl)) {
            String SELECTSQL = "SELECT passcode FROM admin_ip WHERE avaliable_ip = ?";
            PreparedStatement stmt = conn.prepareStatement(SELECTSQL);
            stmt.setString(1, IP);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()){
            String passcode = rs.getString("passcode");
            if (passcode_input.equals(passcode)) {
                isAuthorized = true;
                System.out.println("User is authorized with passcode: " + passcode_input);
            } 
             }
            } catch (SQLException e) {
                e.printStackTrace();
                System.out.println("IP Address not found");
            }

            Map<String, Object> auth = new HashMap<>();
            auth.put("isAuthorized", isAuthorized);
            String jsonResponse = gson.toJson(auth);
            response = newFixedLengthResponse(Response.Status.OK, "application/json", jsonResponse);


            //response = newFixedLengthResponse(Response.Status.OK, "application/json", "{\"status\":\"success\", \"message\":\"Player data updated successfully\"}");
    }
    else if (uri.equals("/drop_sign_up")) {
            Map<String, String> files = new HashMap<>();
            try {
                session.parseBody(files); // Parse the request body
            } catch (IOException | NanoHTTPD.ResponseException e) {
                e.printStackTrace();
                response = newFixedLengthResponse(Response.Status.INTERNAL_ERROR, "application/json", "{\"error\":\"Failed to parse request body\"}");
                response.addHeader("Access-Control-Allow-Origin", "*");
                response.addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                response.addHeader("Access-Control-Allow-Headers", "Content-Type");
                return response;
            }

            String requestBody = files.get("postData");
            if (requestBody == null) {
                response = newFixedLengthResponse(Response.Status.BAD_REQUEST, "application/json", "{\"error\":\"Missing request body\"}");
                response.addHeader("Access-Control-Allow-Origin", "*");
                response.addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                response.addHeader("Access-Control-Allow-Headers", "Content-Type");
                return response;
            }

            // Parse JSON from the request body
            JsonObject json = gson.fromJson(requestBody, JsonObject.class);
            int id = json.get("key_index").getAsInt();
            System.out.println("Received passcode: " + id+1);
            //Map<String, String> params = session.getParms();
            //String passcode_input = params.get("passcode");

            try (Connection conn = DriverManager.getConnection(databaseUrl)) {
                String deleteSQL = "DELETE FROM players WHERE id = ?";
                PreparedStatement stmt = conn.prepareStatement(deleteSQL);
                stmt.setInt(1, id+1);
                stmt.executeUpdate();

                System.out.println("signup removed from the database: " +id+1);
            } catch (SQLException e) {
                e.printStackTrace();
                System.out.println("signup not found");
            }

            try (Connection conn = DriverManager.getConnection(databaseUrl)) {
                String deleteSQL = "UPDATE players SET id = id - 1 WHERE id > ?";
                PreparedStatement stmt = conn.prepareStatement(deleteSQL);
                stmt.setInt(1, id+1);
                stmt.executeUpdate();

                System.out.println("signup renumbered from the database: " +id+1);
            } catch (SQLException e) {
                e.printStackTrace();
                System.out.println("signup not found");
            }

           try (Connection conn = DriverManager.getConnection(databaseUrl)) {
                String resetSequenceSQL = "UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM players) WHERE name = 'players'";
                PreparedStatement stmt = conn.prepareStatement(resetSequenceSQL);
                stmt.executeUpdate();

                System.out.println("signup renumbered from the database: " +id+1);
            } catch (SQLException e) {
                e.printStackTrace();
                System.out.println("signup not found");
            }

           response = newFixedLengthResponse(Response.Status.OK, "application/json", "{\"status\":\"success\", \"message\":\"Player data removed successfully\"}");


            //response = newFixedLengthResponse(Response.Status.OK, "application/json", "{\"status\":\"success\", \"message\":\"Player data updated successfully\"}");
    }
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.addHeader("Access-Control-Allow-Headers", "Content-Type");

        return response;

    }

        private UUID getOnlinePlayerUUID(String playerName) {
            OfflinePlayer player = Bukkit.getOfflinePlayer(playerName);
            if (player.hasPlayedBefore() || player.getUniqueId() != null) {
                try {
                    // Schedule the whitelist update on the main server thread
                    Bukkit.getScheduler().runTask(Bukkit.getPluginManager().getPlugin("minecraft_signup_backend"), () -> {
                        player.setWhitelisted(true); // Ensure the player is whitelisted
                    });
                    return player.getUniqueId(); // Return the UUID of the offline player
                } catch (Exception e) {
                    System.err.println("Failed to add player to whitelist: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            return null; // Return null if the player does not exist
        }

            private String getPublicIP(IHTTPSession session) {
            // Check for the X-Forwarded-For header (used by proxies)
            String userIpAddress = session.getHeaders().get("X-Forwarded-For");
            if (userIpAddress == null || userIpAddress.isEmpty()) {
            // Fallback to remote-addr header
            userIpAddress = session.getHeaders().get("remote-addr");
            }
            return userIpAddress;
            }

        /*public static String getPublicIP() {
        try {
            URL url = new URL("https://api.ipify.org?format=text");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");

            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String ip = in.readLine();
            in.close();

            return ip;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }*/
}

