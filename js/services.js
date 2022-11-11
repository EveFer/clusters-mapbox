async function fetchGeoJSON(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }



const URL_API = "https://api.staging.toroto.avocadoblock.com";

const requestOptions = {
    method: "GET",
    mode: "cors",
};

async function getDataMapByProject(idProject) {
    let data;
    let errorMessage;
    try {
        const response = await fetch(
        `${URL_API}/project_geodata?project_id=${idProject}`,
        requestOptions
        );
        if (response.status === 200) {
        data = await response.json();
        } else {
        data = response.status;
        }
    } catch (error) {
        errorMessage = "Error desconocido";
    }

    if (data) {
        return data;
    } else {
        return errorMessage;
    }
}

async function getDetailsProject(idProject) {
    let data;
    let errorMessage;
    try {
        const response = await fetch(
        `${URL_API}/project_details?project_id=${idProject}`, requestOptions);
        if (response.status === 200) {
            data = await response.json();
        } else {
            data = response.status;
        }
    } catch (error) {
        errorMessage = "Error desconocido";
    }

    if (data) {
        return data;
    } else {
        return errorMessage;
    }
}

export {fetchGeoJSON, getDataMapByProject, getDetailsProject}