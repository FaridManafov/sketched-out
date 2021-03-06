import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import Brushes from './Brushes.jsx'

export default class MainCanvas extends Component {
  constructor(props) {
    super(props)
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.stopPainting = this.stopPainting.bind(this)
  }

  isPainting = false;
  line = null;

  userLines = []
  latestLineIndex = 0

  prevPos = { offsetX: 0, offsetY: 0}
  userStrokeStyle = this.props.lineColor;

  componentDidMount() {
    this.canvas.width = 900;
    this.canvas.height = 450;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.lineWidth = this.props.brushSize
  }

  handleMouseDown = ({ nativeEvent })=> {
    if (this.props.currentlyDrawing === this.props.currentUser) {
      const { offsetX, offsetY } = nativeEvent;
      this.isPainting = true;
      this.prevPos = { offsetX, offsetY };
      const offsetData = { offsetX, offsetY };

      const positionData = {
        start: { ...this.prevPos },
        stop: {...offsetData}
      };

      this.line = {
        prevPos: positionData.start,
        currPos: positionData.stop,
        strokeStyle: this.userStrokeStyle
      }

      this.paint(this.prevPos, this.prevPos, this.userStrokeStyle);
      this.sendPaintData();

    }
  }

  handleMouseMove = ({ nativeEvent }) => {
    if (this.isPainting) {
      const { offsetX, offsetY } = nativeEvent;
      const offsetData = { offsetX, offsetY };

      const positionData = {
        start: { ...this.prevPos },
        stop: {...offsetData}
      };

      this.line = {
        prevPos: positionData.start,
        currPos: positionData.stop,
        strokeStyle: this.userStrokeStyle
      }

      this.paint(this.prevPos, offsetData, this.userStrokeStyle);
      this.sendPaintData()
    }
  }


  paint = (prevPos, currPos, strokeStyle) => {
      const { offsetX, offsetY } = currPos;
      const { offsetX: x, offsetY: y } = prevPos;
      this.ctx.lineWidth = this.props.brushSize;
      this.ctx.beginPath();
      this.ctx.strokeStyle = strokeStyle;
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(offsetX, offsetY);
      this.ctx.stroke();
      this.prevPos = { offsetX, offsetY };
  }

  setBrushSize = (size) => {
    this.ctx.lineWidth = size;

    this.props.sendMessage({
      type: 'changeBrushSize',
      content: size
    })
  }

  userClearCanvas = () => {
    this.userLines = [];
    this.isPainting = false;
    this.ctx.beginPath();
    this.ctx.rect(0, 0, 900, 450);
    this.ctx.fillStyle = 'white';
    this.ctx.fill()

    this.props.sendMessage({
      type: 'userClearCanvas',
      content: ''
    })
  }

  //make message into an object with options
  sendPaintData = () => {
    this.props.sendMessage({
      type: 'latestLineData',
      content: [this.line]
    })
    this.latestLineIndex = this.userLines.length - 1
  }

  stopPainting = ({ nativeEvent }) => {
    if (this.isPainting) {
      this.isPainting = false;
      this.sendPaintData();
    }
  }

  render() {
    if (this.props.latestLineData.length < 1 && this.ctx) {
      // console.log('empty array', this.ctx.fillStyle);
      this.ctx.beginPath();
      this.ctx.rect(0, 0, 900, 450);
      this.ctx.fillStyle = 'white';
      this.ctx.fill()

    }

    if (this.props.latestLineData.length > 0) {

      this.props.latestLineData
      .slice(this.latestLineIndex)
      .forEach((line) => {
        this.paint(line.prevPos, line.currPos, line.strokeStyle)
      });

      this.latestLineIndex = this.userLines.length - 1
    }

    this.userStrokeStyle = this.props.lineColor

    return (
        <div>
          <div>
          <canvas
            id='canvas'
            ref={(ref) => (this.canvas = ref)}
            style={ {background: 'white'} }
            onMouseDown={this.handleMouseDown}
            onMouseMove={this.handleMouseMove}
            onMouseUp={this.stopPainting}
            onMouseLeave={this.stopPainting}
          />
          </div>
          <div id='brush-sizes'>
            <div id='brush-all'>
            <Button
              className='brushes'
              variant="fab" aria-label="S"
              onClick={() => this.setBrushSize(5)}>
              <img src="./styles/inkpen.png" alt="inkpen" height="10" width="10" />
            </Button>
            <Button
              className='brushes'
              variant="fab" aria-label="M"
              onClick={() => this.setBrushSize(10)}>
              <img src="./styles/inkpen.png" alt="inkpen" height="22" width="22" />
            </Button>
            <Button
              className='brushes'
              variant="fab" aria-label="L"
              onClick={() => this.setBrushSize(15)}>
              <img src="./styles/inkpen.png" alt="inkpen" height="34" width="34" />
            </Button>
            </div>
            <div id="brush-container">
              <Brushes
                className="brush-area color-picker"
                lineColor={this.props.lineColor}
                onChange={this.props.changeColor}
              />
            </div>
            <div>
            <Button
              className='trash-button'
              variant="fab"
              onClick={() => this.userClearCanvas()}>
              <p className='fas fa-trash'></p></Button>
            </div>
          </div>
        </div>
    )
  }
}
