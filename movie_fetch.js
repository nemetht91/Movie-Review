import fetch from "node-fetch";


class MovieFetcher{
    constructor(api_key){
        this.api_key = api_key;
        this.base_url = "https://api.themoviedb.org/3/";
        this.options = {
            method: 'GET',
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${this.api_key}`
            },
          };
    }

    async fetchData(url){
        try {
            const result = await fetch(url, this.options);
            const data = await result.json();
            if (result.status == 200){
                return data;
            }
            console.log(`Failed to fetch data: ${result.status} - ${result.statusText}`);
            return null;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async getMovie(title){
        const parameters = new URLSearchParams({
            query: title,
            include_adult: false,
            language: "en-US",
            page: 1
        });
        const url = this.base_url + "search/movie?"+parameters;
        const data = await this.fetchData(url);
        if (data == null){
            return null;
        }
        return data.results;       
    }
}

export default MovieFetcher;
