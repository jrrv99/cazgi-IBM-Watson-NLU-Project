import "./bootstrap.min.css";
import "./App.css";
import EmotionTable from "./EmotionTable.js";
import React from "react";

class App extends React.Component {
  /**
   *We are setting the component as a state named innercomp.
   *When this state is accessed, the HTML that is set as the
   *value of the state, will be returned. The initial input mode
   *is set to text
   */
  state = {
    innercomp: <textarea rows="4" cols="50" id="textinput" />,
    mode: "text",
    sentimentOutput: [],
    sentiment: true,
  };

  /**
   * This method returns the component based on what the input mode is.
   * If the requested input mode is "text" it returns a textbox with 4 rows.
   * If the requested input mode is "url" it returns a textbox with 1 row.
   */

  renderOutput = (input_mode) => {
    //If the input mode is text make it 4 lines
    let [mode, rows] = input_mode === "text" ? ["text", 4] : ["url", 1];

    this.setState({
      innercomp: <textarea rows={rows} cols="50" id="textinput" />,
      mode: mode,
      sentimentOutput: [],
      sentiment: true,
    });
  };

  getURL = (category) => {
    let url = "."; //"http://localhost:8080";
    let mode = this.state.mode;
    let value = document.getElementById("textinput").value;

    return `${url}/${mode}/${category}?${mode}=${value}`;
  };

  asyncFetchData = async (apiURL) => {
    try {
      const res = await fetch(apiURL);

      if (!res.ok) {
        return Promise.reject(await res.json());
      }

      return await res.json();
    } catch (err) {
      return Promise.reject(err);
    }
  };

  sendForSentimentAnalysis = () => {
    this.setState({ sentiment: true });
    let url = this.getURL("sentiment");

    this.asyncFetchData(url)
      .then((data) => {
        let output = data.label;
        let color = "white";
        switch (output) {
          case "positive":
            color = "green";
            break;
          case "negative":
            color = "red";
            break;
          default:
            color = "yellow";
        }
        output = <div style={{ color: color, fontSize: 20 }}>{output}</div>; //
        this.setState({ sentimentOutput: output });
      })
      .catch((err) => {
        let output = (
          <div style={{ color: "red", fontSize: 20 }}>{err.message}</div>
        ); //
        this.setState({ sentimentOutput: output });
        throw err;
      });
  };

  sendForEmotionAnalysis = async () => {
    this.setState({ sentiment: false });
    let url = this.getURL("emotion");

    this.asyncFetchData(url)
      .then((data) => {
        this.setState({ sentimentOutput: <EmotionTable emotions={data} /> });
      })
      .catch((err) => {
        let output = (
          <div style={{ color: "red", fontSize: 20 }}>{err.message}</div>
        );
        this.setState({ sentimentOutput: output });

        throw err;
      });
  };

  render() {
    return (
      <div className="App">
        <button
          className="btn btn-info"
          onClick={() => {
            this.renderOutput("text");
          }}
        >
          Text
        </button>
        <button
          className="btn btn-dark"
          onClick={() => {
            this.renderOutput("url");
          }}
        >
          URL
        </button>
        <br />
        <br />
        {this.state.innercomp}
        <br />
        <button
          className="btn btn-primary"
          onClick={this.sendForSentimentAnalysis}
        >
          Analyze Sentiment
        </button>
        <button
          className="btn btn-secondary"
          onClick={this.sendForEmotionAnalysis}
        >
          Analyze Emotion
        </button>
        <br />
        {this.state.sentimentOutput}
      </div>
    );
  }
}

export default App;
