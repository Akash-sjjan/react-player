// import TestVideoPlayer from './TestVideoPlayer';

import ReactPlayerTest from "./ReactPlayerTest";
const url = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export const App = () => (
  <div>
    {/* <div className="text-lg">Testing the ReactPlayer component</div>
		<TestVideoPlayer /> */}
    <div style={{ width: "70vw" }}>
      <ReactPlayerTest urll={url} />
    </div>
  </div>
);

export default App;
