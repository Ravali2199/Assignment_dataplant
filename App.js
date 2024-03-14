import React, { useState, useEffect } from 'react';

import './App.css'; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrashCan } from "@fortawesome/free-regular-svg-icons";

import axios from 'axios';

function generateTimeOptions() {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = (hour % 12 || 12).toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      const meridiem = hour < 12 ? 'AM' : 'PM';
      const time = `${formattedHour}:${formattedMinute} ${meridiem}`;
      options.push(<option key={time} value={time}>{time}</option>);
    }
  }
  return options;
}

function App() {
  
  const [schedules, setSchedules] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/schedules');
        setSchedules(response.data);
      } catch (error) {
        console.error('Error fetching schedule data:', error);
      }
    };

    fetchData();
  }, []);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    frequency: 'Daily',
    repeat: '',
    time: '10:00 AM',
  });
 
  const [showPopover, setShowPopover] = useState(false);
  
  const [editMode, setEditMode] = useState(false);
  // State for index of schedule being edited
  //const [editIndex, setEditIndex] = useState(null);
  // State for search input value
  //const [searchInput, setSearchInput] = useState('');
  const [searchValue, setSearchValue] = useState('');
 
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 
  const handleSearchInputChange = (e) => {
    setSearchValue(e.target.value);
  };


  const filteredSchedules = schedules.filter((schedule) =>
  schedule.title.toLowerCase().includes(searchValue.toLowerCase()) ||
  schedule.description.toLowerCase().includes(searchValue.toLowerCase()) ||
  schedule.subject.toLowerCase().includes(searchValue.toLowerCase()) ||
  `${schedule.frequency} ${schedule.repeat}`.toLowerCase().includes(searchValue.toLowerCase())
);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.patch(`http://localhost:3001/schedules/${formData.id}`, formData);
        console.log('Schedule updated');
        setSchedules(prevSchedules => {
          const updatedSchedules = prevSchedules.map(schedule => {
            if (schedule.id === formData.id) {
              return formData; 
            }
            return schedule;
          });
          return updatedSchedules;
        });
      } else {
        const response = await axios.post('http://localhost:3001/schedules', formData);
        console.log('New schedule created:', response.data);
        setSchedules(prevSchedules => [...prevSchedules, response.data]);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setFormData({
      id: null,
      title: '',
      description: '',
      subject: '',
      frequency: 'Daily',
      repeat: '',
      time: '10:00 AM', 
    });
    setShowPopover(false);
  };
  
  


  const handleEdit = (schedule) => {
    setEditMode(true);
    setFormData({
      id: schedule.id, 
      title: schedule.title,
      description: schedule.description,
      subject: schedule.subject,
      frequency: schedule.frequency,
      repeat: schedule.repeat,
      time: schedule.time,
    });
    setShowPopover(true);
  };
  

  
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/schedules/${id}`);
      setSchedules(prevSchedules => prevSchedules.filter(schedule => schedule.id !== id));
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };
  

  
  return (
    <div className="App">
      <header>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={handleSearchInputChange}
          />
        </div>
        <h1>Email Schedules</h1>
        <button onClick={() => { setShowPopover(true); setEditMode(false); }}>Add</button>
      </header>
      <div className="schedule-list">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Subject</th>
              <th>Schedule</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.map((schedule, index) => (
              <tr key={index}>
                <td>{schedule.title}</td>
                <td>{schedule.description}</td>
                <td>{schedule.subject}</td>
                <td>{`${schedule.frequency} ${schedule.repeat} at ${schedule.time}`}</td>
                <td>
                  
                  <FontAwesomeIcon icon={faPenToSquare} onClick={() => handleEdit(schedule)}  style={{color: "#050505",}} className="action-icon" />
                  <FontAwesomeIcon icon={faTrashCan} onClick={() => handleDelete(schedule.id)} style={{color: "#050505",}} className="action-icon"/>
                 
                  
    
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showPopover && (
        <div className="popover">
          <h2>{editMode ? 'Edit Schedule' : 'Add Schedule'}</h2>
          
          <form onSubmit={handleSubmit}>
            <label>Title
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
              </label>
           
            <label>Description
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>Subject
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>Frequency
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </label>
            {formData.frequency === 'Weekly' && (
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="repeat"
                    value="Sunday"
                    checked={formData.repeat === 'Sunday'}
                    onChange={handleInputChange}
                  />
                  <span>S</span>
                </label>
                <label>
        <input
        type="checkbox"
        name="repeat"
        value="Monday"
        checked={formData.repeat === 'Monday'}
        onChange={handleInputChange}
      />
      <span>M</span>
    </label>
    <label>
      <input
        type="checkbox"
        name="repeat"
        value="Tuesday"
        checked={formData.repeat === 'Tuesday'}
        onChange={handleInputChange}
      />
      <span>T</span>
    </label>
    <label>
      <input
        type="checkbox"
        name="repeat"
        value="Wednesday"
        checked={formData.repeat === 'Wednesday'}
        onChange={handleInputChange}
      />
      <span>W</span>
    </label>
    <label>
      <input
        type="checkbox"
        name="repeat"
        value="Thursday"
        checked={formData.repeat === 'Thursday'}
        onChange={handleInputChange}
      />
      <span>T</span>
    </label>
    <label>
      <input
        type="checkbox"
        name="repeat"
        value="Friday"
        checked={formData.repeat === 'Friday'}
        onChange={handleInputChange}
      />
      <span>F</span>
    </label>
    <label>
      <input
        type="checkbox"
        name="repeat"
        value="Saturday"
        checked={formData.repeat === 'Saturday'}
        onChange={handleInputChange}
      />
      <span>S</span>
    </label>
              </div>
            )}
            {formData.frequency === 'Monthly' && (
              <select
                name="repeat"
                value={formData.repeat}
                onChange={handleInputChange}
              >
                <option value="Select Value">Select</option>
                <option value="First Monday">First Monday</option>
                <option value="Last Friday">Last Friday</option>
              </select>
            )}
            <label>Time
              <select
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
              >
                {generateTimeOptions()}
              </select>
            </label>
            <div className="button-group">
            <button type="submit">{editMode ? 'Update' : 'Done'}</button>
            <button className="close-button" onClick={() => setShowPopover(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
