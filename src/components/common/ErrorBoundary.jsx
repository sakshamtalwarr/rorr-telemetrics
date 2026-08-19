import React from "react";
import { AlertTriangle } from "lucide-react";

export default class ErrorBoundary
  extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      errorMsg: "",
    };
  }


  static getDerivedStateFromError(error) {

    return {
      hasError: true,
      errorMsg: error.toString(),
    };
  }


  componentDidCatch(error, errorInfo) {

    console.error(
      "Component crashed:",
      error,
      errorInfo
    );
  }


  render() {

    if (this.state.hasError) {

      return (
        <div className="
          h-full w-full
          flex flex-col
          items-center justify-center
          bg-red-900/20
          backdrop-blur-md
          border border-red-500/30
          rounded-3xl
          p-6
          text-center
        ">

          <AlertTriangle
            className="
              w-8 h-8
              text-red-500
              mb-3
              animate-bounce
            "
          />

          <h2 className="
            text-red-400
            font-bold
            mb-2
          ">
            Visual Component Offline
          </h2>

          <p className="
            text-xs
            font-mono
            text-red-300/70
            break-words
          ">
            {this.state.errorMsg}
          </p>

        </div>
      );
    }


    return this.props.children;
  }
}