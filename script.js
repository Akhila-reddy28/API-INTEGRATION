async function fetchEarthquakes() {
    const minMagnitude = parseFloat(document.getElementById("minMagnitude").value) || 0;
    const locationFilter = document.getElementById("locationFilter").value.toLowerCase();
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const earthquakeListDiv = document.getElementById("earthquake-list");
    const alertSection = document.getElementById("alert-section");
    const alertTitle = document.getElementById("alert-title");
    const alertMessage = document.getElementById("alert-message");
    const safetyMeasuresList = document.getElementById("safety-measures-list");
  
    earthquakeListDiv.innerHTML = "Loading...";
    alertSection.style.display = "none"; // Hide alert section initially
  
    const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      const filteredData = filterEarthquakes(data.features, minMagnitude, locationFilter, startDate, endDate);
  
      if (filteredData.length === 0) {
        earthquakeListDiv.innerHTML = "<p>No earthquakes found based on the filters.</p>";
        return;
      }
  
      earthquakeListDiv.innerHTML = "";
  
      // Check if any earthquake exceeds magnitude 5.0 for alert
      let alertTriggered = false;
  
      filteredData.forEach(earthquake => {
        const magnitude = earthquake.properties.mag;
        const location = earthquake.properties.place;
        const time = new Date(earthquake.properties.time).toLocaleString();
  
        // Create the earthquake entry in the list
        const earthquakeHTML = `
          <div class="earthquake">
            <h3>Magnitude: ${magnitude}</h3>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Date & Time:</strong> ${time}</p>
          </div>
        `;
        earthquakeListDiv.innerHTML += earthquakeHTML;
  
        // If earthquake magnitude is 5.0 or higher, trigger the alert
        if (magnitude >= 5.0 && !alertTriggered) {
          alertTriggered = true;
          displayAlert(magnitude, location);
        }
      });
    } catch (error) {
      earthquakeListDiv.innerHTML = "<p style='color:red;'>Error fetching earthquake data.</p>";
      console.error(error);
    }
  }
  
  function filterEarthquakes(data, minMagnitude, locationFilter, startDate, endDate) {
    return data.filter(earthquake => {
      const magnitude = earthquake.properties.mag;
      const location = earthquake.properties.place.toLowerCase();
      const timestamp = earthquake.properties.time;
      const date = new Date(timestamp).toISOString().split("T")[0];
  
      const isMagnitudeValid = magnitude >= minMagnitude;
      const isLocationValid = location.includes(locationFilter.toLowerCase());
      const isDateValid = (!startDate || date >= startDate) && (!endDate || date <= endDate);
  
      return isMagnitudeValid && isLocationValid && isDateValid;
    });
  }
  
  function displayAlert(magnitude, location) {
    const alertSection = document.getElementById("alert-section");
    const alertTitle = document.getElementById("alert-title");
    const alertMessage = document.getElementById("alert-message");
    const safetyMeasuresList = document.getElementById("safety-measures-list");
  
    let alertSymbol = '';
    let alertColorClass = '';
    let safetyMeasures = [];
  
    if (magnitude >= 7.0) {
      alertSymbol = '🔴';
      alertColorClass = 'red';
      alertTitle.innerHTML = `${alertSymbol} Severe Earthquake Warning!`;
      alertMessage.innerHTML = `A very strong earthquake (Magnitude: ${magnitude}) occurred near ${location}. Take immediate action!`;
      safetyMeasures = [
        'Take cover under sturdy furniture.',
        'Move away from glass windows.',
        'Stay in a safe place and avoid leaving until the shaking stops.'
      ];
    } else if (magnitude >= 5.0) {
      alertSymbol = '⚠️';
      alertColorClass = 'yellow';
      alertTitle.innerHTML = `${alertSymbol} Strong Earthquake Detected!`;
      alertMessage.innerHTML = `A strong earthquake (Magnitude: ${magnitude}) occurred near ${location}. Please remain cautious.`;
      safetyMeasures = [
        'Drop, Cover, and Hold On.',
        'Stay away from windows and heavy furniture.',
        'If you are outside, stay in an open area.'
      ];
    } else {
      alertSymbol = '🟢';
      alertColorClass = 'green';
      alertTitle.innerHTML = `${alertSymbol} Minor Earthquake Notice`;
      alertMessage.innerHTML = `A minor earthquake (Magnitude: ${magnitude}) was detected near ${location}. There is no need to panic.`;
      safetyMeasures = [
        'Stay calm and assess your surroundings.',
        'Ensure that your exit routes are clear.'
      ];
    }
  
    alertTitle.classList.add(alertColorClass);
    safetyMeasuresList.innerHTML = safetyMeasures.map(safety => `<li>${safety}</li>`).join('');
  
    // Show the alert section
    alertSection.style.display = "block"
  }
  