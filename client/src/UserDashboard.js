import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import { Container, ListGroup, ListGroupItem, Dropdown, Button } from "react-bootstrap";
import SpotifyWebApi from "spotify-web-api-node";
import axios from "axios";

const URL = "https://api.spotify.com/v1/";

const spotifyApi = new SpotifyWebApi({
    clientId: "8b945ef10ea24755b83ac50cede405a0"
});

export default function UserDashboard({ code }) {
    const accessToken = useAuth(code);
    const [userName, setUserName] = useState();
    const [userCountry, setUserCountry] = useState();
    const [userEmail, setUserEmail] = useState();
    const [playlists, setPlaylists] = useState([]);
    const [refresh, setRefresh] = useState(false)

    useEffect(() => {
        if (!accessToken) return;

        spotifyApi.setAccessToken(accessToken);
    }, [accessToken]);

    useEffect(() => {
        if (!accessToken)
            return;

        const fetchData = async () => {
            const response = await spotifyApi.getMe();
            if (response.statusCode === 200) {
                setUserName(response.body.display_name);
                setUserCountry(response.body.country);
                setUserEmail(response.body.email);
            }

            const response2 = await axios.get(URL + "me/playlists", {
                headers: {
                    Authorization: "Bearer " + accessToken
                }
            });

            if (response2.status === 200) {
                let list = [];
                for (const item of response2.data.items) {
                    const response3 = await axios.get(
                        URL + "playlists/" + item.id + "/tracks",
                        {
                            headers: {
                                Authorization: "Bearer " + accessToken
                            }
                        }
                    );
                    list.push({
                        name: item.name,
                        items: response3.data.items
                    });
                }
                setPlaylists(list);
            }
        };

        fetchData();
    }, [accessToken, refresh]);


    async function deleteItem(pid, id) {
        if (await window.confirm('Do you want to restore this item?')) {
        try {
            const response = await axios.delete(URL + "/playlists/" + pid + "/tracks", {
                headers: {
                    Authorization: "Bearer " + accessToken
                },
                body: {
                    tracks: [id]
                }

            });
            if (response.status == 200)
                console.log(response)
        } catch (e) {
            console.log(e)
        }
        setRefresh(!refresh)
    }
    }

    return (
        <Container className="d-flex flex-column py-2" style={{ height: "100vh" }}>
            <div>
                <div>Name: {userName}</div>
                <div>Country: {userCountry}</div>
                <div>Email: {userEmail}</div>
            </div>
            <div>
                <ListGroup>
                    {playlists.map((p) => {
                        return (
                            <ListGroupItem>
                                <Dropdown>
                                    <Dropdown.Toggle>{p.name}</Dropdown.Toggle>
                                    <Dropdown.Menu>{p.items.map((i) => {
                                        return (
                                            <Dropdown.Item href="#">
                                                {i.track.name}
                                                <Button variant="danger" onClick={() => deleteItem(p.id, i.track.id)}>Delete</Button>
                                            </Dropdown.Item>
                                        )
                                    })}</Dropdown.Menu>
                                </Dropdown>

                            </ListGroupItem>
                        );
                    })}
                </ListGroup>
            </div>
        </Container>
    );
}