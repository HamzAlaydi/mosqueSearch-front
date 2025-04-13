// shared/ui/ProgressBar.jsx
const ProgressBar = ({ step, totalSteps }) => {
    return (
      <div className="progress-bar">
        <div
          className="progress"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        ></div>
      </div>
    );
  };
  
  export default ProgressBar;