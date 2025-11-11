(function() {
  const apiToken = "IqzLLkdlXikJiwReQQpotIUgpVCNfjGC";

  const viewSelector = document.getElementById('viewSelector');
  const stationsView = document.getElementById('stationsView');
  const datasetsView = document.getElementById('datasetsView');
  const dataView = document.getElementById('dataView');

  viewSelector.addEventListener('change', () => {
    const selectedValue = viewSelector.value;
    stationsView.style.display = (selectedValue === 'stations') ? 'flex' : 'none';
    datasetsView.style.display = (selectedValue === 'datasets') ? 'flex' : 'none';
    dataView.style.display = (selectedValue === 'data') ? 'flex' : 'none';
  });

  // Stacje
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
      const response = await fetch(apiUrl, { headers: { 'token': apiToken } });
      if (!response.ok) { throw new Error(response.status === 401 ? "Błąd autoryzacji (Stacje)." : `Błąd HTTP (Stacje): ${response.status}`); }
      const data = await response.json();
      stationsResultsBody.innerHTML = "";
      if (!data.results || data.results.length === 0) { showStationsError("Nie znaleziono stacji."); return; }
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

  // Zbiory
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
      const response = await fetch(apiUrl, { headers: { 'token': apiToken } });
      if (!response.ok) { throw new Error(response.status === 401 ? "Błąd autoryzacji (Zbiory)." : `Błąd HTTP (Zbiory): ${response.status}`); }
      const data = await response.json();
      datasetsResultsBody.innerHTML = "";
      if (!data.results || data.results.length === 0) { showDatasetsError("Nie znaleziono zbiorów."); return; }
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

  // Dane
  const dataForm = document.getElementById('dataForm');
  const datasetInput = document.getElementById('datasetInput');
  const locationInput = document.getElementById('locationInput');
  const startDateInput = document.getElementById('startDateInput');
  const endDateInput = document.getElementById('endDateInput');
  const dataResultsBody = document.getElementById('dataResultsBody');
  const dataErrorDiv = document.getElementById('dataErrorMessages');

  function showDataError(message) {
    dataErrorDiv.textContent = message;
    dataErrorDiv.style.display = 'block';
  }

  async function fetchDataWithParams(event) {
    event.preventDefault();
    dataErrorDiv.textContent = '';
    dataErrorDiv.style.display = 'none';
    dataResultsBody.innerHTML = "<tr><td colspan='3'>Ładowanie...</td></tr>";

    const datasetid = datasetInput.value.trim();
    const locationid = locationInput.value.trim();
    const startdate = startDateInput.value;
    const enddate = endDateInput.value;

    if (!datasetid || !locationid || !startdate || !enddate) {
      showDataError("Wszystkie pola są wymagane.");
      dataResultsBody.innerHTML = "";
      return;
    }

    const baseUrl = "https://www.ncei.noaa.gov/cdo-web/api/v2/data";
    const params = new URLSearchParams({
      datasetid: datasetid,
      locationid: locationid,
      startdate: startdate,
      enddate: enddate,
      limit: 100
    });

    const apiUrl = `https://corsproxy.io/?${baseUrl}?${params.toString()}`;

    try {
      const response = await fetch(apiUrl, {
        headers: { 'token': apiToken }
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error("Błąd 400 (Bad Request). Sprawdź format dat (YYYY-MM-DD) lub ID.");
        }
        if (response.status === 401) {
          throw new Error("Błąd autoryzacji 401 (Dane). Sprawdź klucz API.");
        }
        throw new Error(`Błąd HTTP (Dane): ${response.status}`);
      }

      const data = await response.json();
      dataResultsBody.innerHTML = "";

      if (!data.results || data.results.length === 0) {
        showDataError("Brak danych dla podanych kryteriów.");
        return;
      }

      data.results.forEach(record => {
        const row = document.createElement('tr');
        const formattedDate = record.date ? record.date.split('T')[0] : 'Brak daty';
        row.innerHTML = `
          <td>${formattedDate}</td>
          <td>${record.datatype ?? 'Brak typu'}</td>
          <td>${record.value ?? 'Brak wartości'}</td>
        `;
        dataResultsBody.appendChild(row);
      });

    } catch (error) {
      dataResultsBody.innerHTML = "";
      if (error instanceof Error) {
        showDataError(error.message);
      } else {
        showDataError("Wystąpił nieznany błąd.");
      }
      console.error(error);
    }
  }

  dataForm.addEventListener('submit', fetchDataWithParams);

})();