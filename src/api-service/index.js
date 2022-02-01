import axios from "axios";


export class APIService {

    static #songservers = [];
    static #PRODUCTION = true;
    static #LOCAL_URL = "http://localhost:5000";

    static async keepServersActive() {

        if (this.#songservers.length === 0) {

            this.#songservers.push(
                ...await axios({
                    method: "GET",
                    url: this.#PRODUCTION ? "/api/activateCheck" : this.#LOCAL_URL + "/api/activateCheck"
                }).then(res => {
                    return (
                        res &&
                        res.data &&
                        res.data.server
                    ) || [];
                })
            );

            this.#songservers.push(
                this.#PRODUCTION ? "/api/activateCheck" : this.#LOCAL_URL + "/api/activateCheck"
            );

        }
    
        await Promise.all(
            this.#songservers.map(
                async server => {
                    try {
                        const response = await axios.get(server);
                        return response;
                    }
                    catch(e) {
                        if (e) return;
                    }
                }
            )
        );

    }

    static async #sendRequest(config = {}) {

        try {
            const response = await axios({
                method: config.method,
                url: this.#PRODUCTION ? `/api${config.endpoint}` : `${this.#LOCAL_URL}/api${config.endpoint}`,
                data: config.data || {}
            });
            const { data = {} } = response;
            if (data.redirect) {
                window.location.href = data.to;
                return null;
            }
            return data;
        }
        catch(e) {
            return null;
        }

    }

    static async addToRecentlyPlayed(data = {}) {
        return await this.#sendRequest({
            method: "POST",
            endpoint: "/addToRecentlyPlayed",
            data
        });
    }

    static async signOut() {
        return await this.#sendRequest({
            method: "GET",
            endpoint: "/sign-out"
        });
    }

    static async whosThis() {
        return await this.#sendRequest({
            method: "GET",
            endpoint: "/whosthis"
        });
    }

    static async getAlbum(albumId) {
        return await this.#sendRequest({
            method: "GET",
            endpoint: `/getAlbumDetails?albumId=${albumId}`
        });
    }

    static async startRadio(id, type) {
        return await this.#sendRequest({
            method: "GET",
            endpoint: `/startradio?exclude=${id}&type=${type}`
        });
    }

    static async getHomeAlbums() {
        return await this.#sendRequest({
            method: "GET",
            endpoint: `/getHomeAlbums`
        });
    }

    static async getLibrary(page) {
        return await this.#sendRequest({
            method: "GET",
            endpoint: `/getLibrary?page=${page}`
        });
    }

    static async getLyrics(song) {
        return await this.#sendRequest({
            method: "GET",
            endpoint: `/getLyrics?name=${song.Title || song.Album}`
        });
    }

    static async search(value) {
        return await this.#sendRequest({
            method: "GET",
            endpoint: `/search${value}`
        });
    }

    static async getTrack(albumId, trackId) {
        return await this.#sendRequest({
            method: "GET",
            endpoint: `/getTrack?albumId=${albumId}&trackId=${trackId}`
        });
    }

    static async activateCheck() {
        return await this.#sendRequest({
            method: "GET",
            endpoint: "/activateCheck"
        });
    }

    static async recordTime() {
        return await this.#sendRequest({
            method: "GET",
            endpoint: "/recordTime"
        });
    }

}