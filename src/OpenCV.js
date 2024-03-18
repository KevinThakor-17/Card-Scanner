import React, { useRef, useState, useEffect } from 'react';
import { Table, Spinner } from 'react-bootstrap';
import cv from 'opencv.js';

const OpenCV = () => {
  const videoRef = useRef(null);
  const [scannedSPID, setScannedSPID] = useState('');
  const [scannedContact, setScannedContact] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    startScan();
  }, []); // Empty dependency array ensures this effect runs only once on mount

  const startScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopScan = () => {
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    videoRef.current.srcObject = null;
  };

  const captureImage = async () => {
    setLoading(true);

    const canvas = document.createElement('canvas');
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const src = cv.matFromImageData(imageData);

    stopScan();
    performOCR(src);
  };

  const performOCR = async (src) => {
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    const dst = new cv.Mat();
    cv.threshold(gray, dst, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);

    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    let text = '';
    for (let i = 0; i < contours.size(); ++i) {
      const contour = contours.get(i);
      const boundingRect = cv.boundingRect(contour);
      const roi = dst.roi(boundingRect);
      const output = new cv.Mat();
      cv.resize(roi, output, new cv.Size(100, 100)); // Adjust the size as needed
      cv.imshow('outputCanvas', output); // Show the cropped and resized image

      // Use OCR library or algorithm to extract text from the cropped image
      // For demonstration, you can use an OCR library like Tesseract.js here

      roi.delete();
      output.delete();
    }

    gray.delete();
    dst.delete();
    contours.delete();
    hierarchy.delete();

    setScannedText(text);
    setLoading(false);
  };

  return (
    <div className="d-flex justify-content-center align-items-top vw-80 vh-80 bg-secondary border border-dark rounded">
      <div className="d-flex flex-column align-items-center mt-1 ms-2">
        <video className='mt-1 border' ref={videoRef} style={{ height: 400, width: 450 }} autoPlay></video>
        <div className="d-flex justify-content-center mt-2 ">
          <button className="btn btn-success border border-dark m-1" onClick={captureImage}>Capture Image</button>
        </div>
      </div>
      <div style={{marginLeft:10}} className="">
        {loading && (
          <div className="text-center mt-3">
            <Spinner animation="border" variant="primary" />
            <p>Scanning...</p>
          </div>
        )}
        {scannedText && !loading && (
          <div className="mt-3">
            <h2 className="text-center">Scanned Text</h2>
            <Table className="table table-bordered table-dark table-striped table-hover">
              <tbody>
                <tr>
                  <td>{scannedText}</td>
                </tr>
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenCV;
