(function() {
  const apiToken = "IqzLLkdlXikJiwReQQpotIUgpVCNfjGC";

  const fetchButton = document.getElementById('fetchButton');
  const resultsBody = document.getElementById('resultsBody');
  const errorDiv = document.getElementById('errorMessages');

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }

  function clearError() {
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
  }

  async function fetchData() {
    clearError();
    resultsBody.innerHTML = "<tr><td colspan='4'>Ładowanie...</td></tr>";

    const apiUrl = "https://corsproxy.io/?https://www.ncei.noaa.gov/cdo-web/api/v2/stations?limit=50";

    try {
      const response = await fetch(apiUrl, {
        headers: {
          'token': apiToken
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Błąd autoryzacji 401. Twój klucz API jest nieprawidłowy.");
        }
        throw new Error(`Błąd HTTP: ${response.status}`);
      }

      const data = await response.json();

      resultsBody.innerHTML = "";

      if (!data.results || data.results.length === 0) {
        showError("Nie znaleziono żadnych stacji.");
        return;
      }

      data.results.forEach(station => {
        const row = document.createElement('tr');

        const stationId = station.id ?? 'Brak ID';
        const name = station.name ?? 'Brak nazwy';
        const latitude = station.latitude ?? 'Brak danych';
        const longitude = station.longitude ?? 'Brak danych';

        row.innerHTML = `
          <td>${stationId}</td>
          <td>${name}</td>
          <td>${latitude}</td>
          <td>${longitude}</td>
        `;
        resultsBody.appendChild(row);
      });

    } catch (error) {
      resultsBody.innerHTML = "";
      if (error instanceof Error) {
        showError(error.message);
      } else {
        showError("Wystąpił nieznany błąd.");
      }
      console.error(error);
    }
  }

  fetchButton.addEventListener('click', fetchData);
})();