(function() {
  const apiToken = "IqzLLkdlXikJiwReQQpotIUgpVCNfjGC";

  const viewSelector = document.getElementById('viewSelector');
  const stationsView = document.getElementById('stationsView');
  const datasetsView = document.getElementById('datasetsView');

  viewSelector.addEventListener('change', () => {
    if (viewSelector.value === 'stations') {
      stationsView.style.display = 'flex';
      datasetsView.style.display = 'none';
    } else {
      stationsView.style.display = 'none';
      datasetsView.style.display = 'flex';
    }
  });

  const fetchStationsButton = document.getElementById('fetchStationsButton');
  const stationsResultsBody = document.getElementById('stationsResultsBody');
  const stationsErrorDiv = document.getElementById('stationsErrorMessages');

  function showStationsError(message) {
    stationsErrorDiv.textContent = message;
    stationsErrorDiv.style.display = 'block';
  }

  async function fetchStations() {
    stationsErrorDiv.textContent = '';
    stationsErrorDiv.style.display = 'none';
    stationsResultsBody.innerHTML = "<tr><td colspan='4'>Ładowanie...</td></tr>";

    const apiUrl = "https://corsproxy.io/?https://www.ncei.noaa.gov/cdo-web/api/v2/stations?limit=50";

    try {
      const response = await fetch(apiUrl, {
        headers: { 'token': apiToken }
      });
      if (!response.ok) {
        throw new Error(response.status === 401 ? "Błąd autoryzacji (Stacje)." : `Błąd HTTP (Stacje): ${response.status}`);
      }
      const data = await response.json();
      stationsResultsBody.innerHTML = "";
      if (!data.results || data.results.length === 0) {
        showStationsError("Nie znaleziono stacji.");
        return;
      }
      data.results.forEach(station => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${station.id ?? 'Brak ID'}</td>
          <td>${station.name ?? 'Brak nazwy'}</td>
          <td>${station.latitude ?? 'Brak danych'}</td>
          <td>${station.longitude ?? 'Brak danych'}</td>
        `;
        stationsResultsBody.appendChild(row);
      });
    } catch (error) {
      stationsResultsBody.innerHTML = "";
      showStationsError(error.message);
      console.error(error);
    }
  }

  fetchStationsButton.addEventListener('click', fetchStations);

  const fetchDatasetsButton = document.getElementById('fetchDatasetsButton');
  const datasetsResultsBody = document.getElementById('datasetsResultsBody');
  const datasetsErrorDiv = document.getElementById('datasetsErrorMessages');

  function showDatasetsError(message) {
    datasetsErrorDiv.textContent = message;
    datasetsErrorDiv.style.display = 'block';
  }

  async function fetchDatasets() {
    datasetsErrorDiv.textContent = '';
    datasetsErrorDiv.style.display = 'none';
    datasetsResultsBody.innerHTML = "<tr><td colspan='5'>Ładowanie...</td></tr>";

    const apiUrl = "https://corsproxy.io/?https://www.ncei.noaa.gov/cdo-web/api/v2/datasets?limit=25";

    try {
      const response = await fetch(apiUrl, {
        headers: { 'token': apiToken }
      });
      if (!response.ok) {
        throw new Error(response.status === 401 ? "Błąd autoryzacji (Zbiory)." : `Błąd HTTP (Zbiory): ${response.status}`);
      }
      const data = await response.json();
      datasetsResultsBody.innerHTML = "";

      if (!data.results || data.results.length === 0) {
        showDatasetsError("Nie znaleziono zbiorów.");
        return;
      }

      data.results.forEach(dataset => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${dataset.id ?? 'Brak ID'}</td>
          <td>${dataset.name ?? 'Brak nazwy'}</td>
          <td>${dataset.description ?? 'Brak opisu'}</td>
          <td>${dataset.mindate ?? 'Brak danych'}</td>
          <td>${dataset.maxdate ?? 'Brak danych'}</td>
        `;
        datasetsResultsBody.appendChild(row);
      });
    } catch (error) {
      datasetsResultsBody.innerHTML = "";
      showDatasetsError(error.message);
      console.error(error);
    }
  }

  fetchDatasetsButton.addEventListener('click', fetchDatasets);

})();