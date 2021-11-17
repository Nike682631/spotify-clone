import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import { Container, ListGroup, ListGroupItem, Dropdown, Button, Image, Row, Col } from "react-bootstrap";
import Accordion from 'react-bootstrap/Accordion'
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
                console.log(response2)
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
                        items: response3.data.items,
                        url: item.images[2].url,
                        id: item.id
                    });
                }
                setPlaylists(list);
            }
        };

        fetchData();
    }, [accessToken, refresh]);


    async function deleteItem(pid, id) {
        if (window.confirm('Do you want to restore this item?')) {
            try {
                const response = await spotifyApi.removeTracksFromPlaylist(pid, [{
                    uri: id
                }])
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
                {playlists.map((p) => {
                    return (
                        <Accordion>
                            <Accordion.Item>
                                <Accordion.Header as='h6'>
                                    <Image src={p.url} roundedCircle />{p.name}
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ListGroup>
                                        {p.items.map((i) => {
                                            return (
                                                <ListGroupItem>
                                                    <Row>
                                                        <Col>{i.track.name}</Col>
                                                        <Col><Button variant="danger" onClick={() => deleteItem(p.id, i.track.id)}>Delete</Button> </Col>
                                                    </Row>
                                                </ListGroupItem>
                                            )
                                        })}
                                    </ListGroup>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    );
                })}
            </div>
        </Container>
    );
}