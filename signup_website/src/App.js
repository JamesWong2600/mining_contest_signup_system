import React, { useState, useEffect } from 'react';
import './App.css';
import config from './config.json';

function App() {
  const [players, setPlayers] = useState(null);
  const [isPermittedUser, setIsPermittedUser] = useState(false); // Track LAN mode globally
  const [editmode, setEditMode] = useState(false); // Track edit mode globally
  const [formData, setFormData] = useState({}); // Track form data for editing
    useEffect(() => {
    const fetchPlayers = () => {
      fetch(`${config.apiBaseUrl}/get_all_players`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          setPlayers(data.players);
          setIsPermittedUser(data.PermittedUser); // Check if isLan is true or false
          if (Array.isArray(data) && data.length > 0) {
            setIsPermittedUser(data[0].PermittedUser === "true");
          }
          console.log('PermittedUser:', isPermittedUser);
        })
        .catch((error) => console.error('Error fetching players:', error));
    };

    // Fetch players every second
    const intervalId = setInterval(fetchPlayers, 2000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleEditChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };
  
  const handleClick = (index) => {
    const userInput = prompt("請輸入passcode");
      const jsonData = {
        passcode: userInput,
      };
      fetch(`${config.apiBaseUrl}/check_auth`, {
      method: 'POST',
      body: JSON.stringify(jsonData), 
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data.isAuthorized) {
          handleSave(index)
          console.log('Edit saved successfully for player at index:', index);
        } else {
          alert('Unauthorized access. Please try again.');
          console.log('Unauthorized access attempt with passcode:', userInput);
        }
      })
      .catch((error) => {console.error('Error saving player:', error)
      });
  };

   const handleDeleteClick = (index) => {
    const userInput = prompt("請輸入passcode");
      const jsonData = {
        passcode: userInput,
      };
      fetch(`${config.apiBaseUrl}/check_auth`, {
      method: 'POST',
      body: JSON.stringify(jsonData), 
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data.isAuthorized) {
          handleDelete(index)
          console.log('Edit saved successfully for player at index:', index);
        } else {
          alert('Unauthorized access. Please try again.');
          console.log('Unauthorized access attempt with passcode:', userInput);
        }
      })
      .catch((error) => {console.error('Error saving player:', error)
      });
  };

     const handleExportClick = () => {
    const userInput = prompt("請輸入passcode");
      const jsonData = {
        passcode: userInput,
      };
      fetch(`${config.apiBaseUrl}/check_auth`, {
      method: 'POST',
      body: JSON.stringify(jsonData), 
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data.isAuthorized) {
          downloadFileWithGroup()
        } else {
          alert('Unauthorized access. Please try again.');
          console.log('Unauthorized access attempt with passcode:', userInput);
        }
      })
      .catch((error) => {console.error('Error saving player:', error)
      });
  };


    const downloadFileWithGroup = async () => {
    const userInput = prompt("請輸入需要輸出的分組");
    if (!userInput) return;
    const jsonData = {
        groups: userInput
      };

    try {
      const response = await fetch(`${config.apiBaseUrl}/export_whitelist`, {
        method: "POST",
        body: JSON.stringify(jsonData),
      });

      console.log('Response status:', response.status);

      if (!response.ok) throw new Error("Download failed");

      const blob =  await response.blob();
      const url = window.URL.createObjectURL(blob);
      alert('成功輸出');
      const a = document.createElement("a");
      a.href = url;
      a.download = `groups_${userInput}.json`; // or use backend-disposition name
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Downloaded failed: " + error.message);
    }
    };

   const handleDelete = (index) => {
      const jsonData = {
        key_index: index,
      };
    fetch(`${config.apiBaseUrl}/drop_sign_up`, {
      method: 'POST',
      body: JSON.stringify(jsonData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
         alert('成功删除報名記錄');
        setEditMode(null); // Exit edit mode
        setFormData({}); // Clear form data
        console.log(`drop sign up for player at index ${index}`);
      })
      .catch((error) => {console.error('Error saving player:', error)
              console.log('Request payload:', JSON.stringify(jsonData));
      });
  };


  const handleSave = (index) => {
    const updatedPlayer = { ...players[index], ...formData, index };
    console.log(`Saving changes for player at index ${index}:`, updatedPlayer);
    fetch(`${config.apiBaseUrl}/edit_save`, {
      method: 'POST',
      body: JSON.stringify(updatedPlayer),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        alert('成功修改');
        setPlayers(data.players);
        setEditMode(null); // Exit edit mode
        setFormData({}); // Clear form data
        console.log(`Saved changes for player at index ${index}`);
      })
      .catch((error) => {console.error('Error saving player:', error)
              console.log('Request payload:', JSON.stringify(updatedPlayer));
      });
  };


  return (
    <div className="App">
      <header className="App-header">
        <h1>報名清單</h1>
        {players ? (
          isPermittedUser ? (
            <div>
              <p>管理員模式</p>
              <table style={{ borderCollapse: 'collapse', margin: 'auto'  }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>編號</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Discord頭像</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Discord名稱</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Minecraft頭像</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Minecraft名稱</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>玩家分組</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>編輯</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>刪除</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, index) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{index+1}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        <img
                          src={player.avatar_url}
                          alt={`${player.discord_username}'s Discord Avatar`}
                          style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                        />
                      </td>
                       {editmode === index ? (
                        <>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.discord_username}</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                            <input
                              type="text"
                              defaultValue={player.minecraft_player}
                              onChange={(e) => handleEditChange(e, 'minecraft_player')}
                              style={{ width: '100%' }}
                            />
                          </td>
                         <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                         <img
                          src={`https://crafatar.com/avatars/${player.minecraft_player_uuid}?size=50&overlay`}
                          alt={`${player.minecraft_player}'s Minecraft Avatar`}
                          style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                         />
                        </td>
                           <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                            <input
                              type="text"
                              defaultValue={player.groups}
                              onChange={(e) => handleEditChange(e, 'groups')}
                              style={{ width: '100%' }}
                            />
                          </td>
                              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <button
                                  onClick={() => handleClick(index)}
                                  style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    backgroundColor: '#4CAF50', // Green background
                                    color: 'white', // White text
                                    border: 'none', // Remove border
                                    borderRadius: '5px', // Rounded corners
                                    cursor: 'pointer', // Pointer cursor
                                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Add shadow
                                  }}
                                >
                                  保存
                                </button>
                              </td>
                              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <button
                                  onClick={() => handleDeleteClick(index)}
                                  style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    backgroundColor: '#f44336', // Red background
                                    color: 'white', // White text
                                    border: 'none', // Remove border
                                    borderRadius: '5px', // Rounded corners
                                    cursor: 'pointer', // Pointer cursor
                                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Add shadow
                                  }}
                                >
                                  刪除
                                </button>
                              </td>
                        </>
                      ) : (
                        <>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.discord_username}</td>
                         <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                          <img
                            src={`https://crafatar.com/avatars/${player.minecraft_player_uuid}?size=50&overlay`}
                            alt={`${player.minecraft_player}'s Minecraft Avatar`}
                            style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                          />
                        </td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.minecraft_player}</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.groups === '0' ? '未分組' : player.groups}</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                            <button
                              onClick={() => setEditMode(index)}
                              style={{
                                  padding: '10px 20px',
                                  fontSize: '14px',
                                  backgroundColor: '#4CAF50', // Green background
                                  color: 'white', // White text
                                  border: 'none', // Remove border
                                  borderRadius: '5px', // Rounded corners
                                  cursor: 'pointer', // Pointer cursor
                                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Add shadow
                                }}
                            >
                              編輯
                            </button>
                          </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                            <button
                              // onClick={() => handleSave(index)} 
                              onClick={() => handleDeleteClick(index)}
                                  style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    backgroundColor: '#f44336', // Red background
                                    color: 'white', // White text
                                    border: 'none', // Remove border
                                    borderRadius: '5px', // Rounded corners
                                    cursor: 'pointer', // Pointer cursor
                                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Add shadow
                                  }}
                            >
                              刪除
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                // onClick={() => handleSave(index)} 
                onClick={() => handleExportClick()}
                    style={{
                      padding: '10px 20px',
                      fontSize: '14px',
                      backgroundColor: 'orange', // Red background
                      color: 'white', // White text
                      border: 'none', // Remove border
                      borderRadius: '5px', // Rounded corners
                      cursor: 'pointer', // Pointer cursor
                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Add shadow
                    }}
              >
                輸出白名單
              </button>
            </div>
          ) : (
            <div>
              <p>以下數據非真實數據</p>
              <table style={{ borderCollapse: 'collapse', margin: 'auto' }}>
                <thead>
                  <tr>
                   <th style={{ border: '1px solid #ddd', padding: '8px' }}>編號</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Discord頭像</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Discord名稱</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Minecraft頭像</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Minecraft名稱</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>玩家分組</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, index) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{index+1}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        <img
                          src={player.avatar_url}
                          alt={`${player.discord_username}'s Discord Avatar`}
                          style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                        />
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.discord_username}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        <img
                          src={`https://crafatar.com/avatars/${player.minecraft_player_uuid}?size=50&overlay`}
                          alt={`${player.minecraft_player}'s Minecraft Avatar`}
                          style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                        />
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.minecraft_player}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.groups === '0' ? '未分組' : player.groups}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <p>Loading players...</p>
        )}
      </header>
    </div>
  );
}


export default App;