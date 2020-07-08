// Retry once to handle flakes
export default async function retryableFetch(endpoint, params) {
	let response;
	try {
		response = await fetch(endpoint, params);
		if (!response.ok) {
			response = await fetch(endpoint, params);
		}
		// Handles HTTP2 flakes
	} catch (e) {
		response = await fetch(endpoint, params);
	}

	return response;
}
