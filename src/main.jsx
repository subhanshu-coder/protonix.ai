// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
 // ADD THIS LINE
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

 
// ErrorBoundary.jsx
// import React from "react";

// class ErrorBoundary extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { hasError: false };
//   }

//   static getDerivedStateFromError(error) {
//     return { hasError: true };
//   }

//   componentDidCatch(error, errorInfo) {
//     // You can log error info here
//   }

//   render() {
//     if (this.state.hasError) {
//       return <h1>Something went wrong.</h1>;
//     }
//     return this.props.children;
//   }
// }

// export default ErrorBoundary;