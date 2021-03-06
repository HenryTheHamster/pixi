'use strict';

var PIXI = require('pixi.js');

//jshint maxparams:false
module.exports = {
  type: 'OnClientReady',
  deps: ['Config', 'StateTracker', 'DefinePlugin', 'CurrentState', 'CurrentServerState', '$'],
  func: function View (config, tracker, define, currentState, currentServerState, $) {

    function updateBall (current, prior, ball) {
      ball.position.x = current.x;
      ball.position.y = current.y;
    }

    function updateColour (current, prior, ball) {
      ball.tint = current === 'happy' ? 0xffffff : 0x0000ff;
    }

    function theBallPosition (state) {
      return state.demo.ball.position;
    }

    function theBallDemeanour (state) {
      return state.demo.ball.demeanour;
    }

    function theBallRadius (state) {
      return state.demo.ball.radius;
    }

    function theBoardDimensions (state) {
      return state.demo.board;
    }

    function calculateOffset (boardDimensions, screenDimensions) {
      return {
        x: (screenDimensions.usableWidth - boardDimensions.width) / 2,
        y: (screenDimensions.usableHeight - boardDimensions.height) / 2
      };
    }

    function createServerBall () {
      var ball = new PIXI.Graphics();
      ball.beginFill(0xff0000);
      ball.drawCircle(0, 0, currentState().get(theBallRadius));

      return ball;
    }

    function createClientBall () {
      var ball = new PIXI.Graphics();
      ball.beginFill(0x0000ff);
      ball.drawCircle(0, 0, currentState().get(theBallRadius));

      return ball;
    }

    function createBoard () {
      var board = new PIXI.Graphics();
      board.beginFill(0x38806F);
      board.drawRect(0, 0, currentState().get(theBoardDimensions).width, currentState().get(theBoardDimensions).height);

      return board;
    }

    var offset;
    return function setup (dims) {
      var stage = new PIXI.Container();
      var renderer = PIXI.autoDetectRenderer(dims.usableWidth, dims.usableHeight);
      $()('#' + config().client.element).append(renderer.view);

      offset = calculateOffset(currentState().get(theBoardDimensions), dims);
      stage.position.x = offset.x;
      stage.position.y = offset.y;

      var serverBall = createServerBall();
      var clientBall = createClientBall();
      stage.addChild(createBoard());
      stage.addChild(serverBall);
      stage.addChild(clientBall);

      tracker().onChangeOf(theBallPosition, updateBall, clientBall);
      tracker().onChangeOf(theBallDemeanour, updateColour, clientBall);

      define()('OnRenderFrame', function OnRenderFrame () {
        return function updateServerBall () {
          var position = currentServerState().get(theBallPosition);
          var demeanour = currentServerState().get(theBallDemeanour);

          serverBall.position = position;
          if (demeanour === 'happy') {
            serverBall.tint = 0xffffff;
          } else {
            serverBall.tint = 0xff0000;
          }
        };
      });

      define()('OnRenderFrame', function OnRenderFrame () {
        return function renderScene () {
          renderer.render(stage);
        };
      });
    };
  }
};