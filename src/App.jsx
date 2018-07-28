import React, {Component} from 'react';
import Leaderboard from './Components/Leaderboard.jsx';
import Main        from './Main.jsx';
import NavBar      from './Components/NavBar.jsx';
import AuthService from "./AuthService.jsx";


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      latestLineData: []
    }
  }

  componentDidMount() {
    this.Auth = new AuthService();
    // const user = this.Auth.getProfile()
    // console.log(user)
    this.socket = new WebSocket(`ws://localhost:8080`);
    this.socket.onopen = (e) => {
      console.log('==> Socket connection started!')
    }

    this.socket.onmessage = (e) => {
      const parsedMessage = JSON.parse(e.data)
      console.log(parsedMessage);

      switch (parsedMessage.type) {
        case 'latestLineData':
          this.setState({
            latestLineData: parsedMessage.content
          });
        break;
      }
    }
  }

  sendMessage = message => {
    this.socket.send(JSON.stringify(message))
  }

  render() {
    return (
      <div>
        <NavBar />
        <Main
          latestLineData={this.state.latestLineData} sendMessage={this.sendMessage}
        />
      </div>
    )
  }
}

export default App;
