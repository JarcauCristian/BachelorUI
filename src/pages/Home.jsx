import * as React from "react";

const Home = ({token}) => {
    const [data, setData] = React.useState(null);
  return (
    <div>
      <iframe
        title="Streamlit App"
        id="output-frame-id"
        src="http://localhost:8443"
        width="100%"
        height="500px"
        frameBorder="0"
      />
    </div>
  );
};

export default Home;
