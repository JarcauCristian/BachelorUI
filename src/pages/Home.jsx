import * as React from "react";

const Home = ({token}) => {
    const [data, setData] = React.useState(null);

	const setHeaders = () => {

		const method = "GET"
		const authorization = `Bearer ${token}`
		const headers = {"Authorization": authorization,
			"Content-Type": "application/json"}
		const options = {method, headers}

		fetch("http://localhost:8000/validate_token", options)
			.then(response => response.blob())
			.then(response => {
				var blob = new Blob([response], {type: "application/json"})
				const obj = URL.createObjectURL(blob)
				setData(obj)
			})
			.catch(e => console.error("Error", e))
	}
  return (
    <div>
      <iframe
        title="Streamlit App"
        id="output-frame-id"
        src={data != null ? "http://localhost:8050" : ""}
        width="100%"
        height="500px"
        frameBorder="0"
        onLoad={setHeaders}
      />
    </div>
  );
};

export default Home;
