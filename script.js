/*
	Copyright 2024 - tkettner - Bizzy126.de
  All unauthorized distribution of this source code will be persecuted to the fullest extent of the law ;-)
*/

var game, config;

function documentLoaded()
{
  config = new minesweeperConfig();
  config.info = new gameinfo();

  config.getElems().forEach(
    elem => 
    {
      document.getElementById("gameconfig").appendChild(elem)
    });
  document.getElementById("gameinfo").replaceChildren(config.info.getElem());
}

function newGame() 
{
  game?.stopTimer();
  game = new minesweeper(config);

  var stats = game.generate();
  config.info.showGamestats(stats);
  document.getElementById("playfield").replaceChildren(game.getElem());

  game.setTableStyle();
}

class minesweeper
{
  constructor(config)
  {
    this.cellCountX = config.x;
    this.cellCountY = config.y;
    this.mineProb = config.mineProb;
    this.info = config.info;
    this.strgPressed = false;
    this.cells = {};
    this.keyListenerShouldBeActive = false;
    this.seconds = "00";
    this.millis = "00";
    this.interval = null;
    this.gameRunning = false;

    this.secondsElem = document.getElementById("statSeconds");
    this.millisElem = document.getElementById("statMillis");

    document.onkeydown = function(e)
    { 
      if(e.key == "Control" && !this.strgPressed && this.keyListenerShouldBeActive)
      {
        console.log("strg down");
        this.strgPressed = true;
      }
    }.bind(this);

    document.onkeyup = function(e)
    { 
      if(e.key == "Control" && this.keyListenerShouldBeActive)
      {
        console.log("strg up");
        this.strgPressed = false;
      }
    }.bind(this);
  }

  cellCount()
  {
    return this.cellCountX * this.cellCountY;
  }

  startTimer()
  {
    this.seconds = "00";
    this.millis = "00";
    clearInterval(this.interval);
    this.interval = setInterval(this.timerFunc.bind(this), 10);
  }

  stopTimer()
  {
    clearInterval(this.interval);
  }

  timerFunc()
  {
    this.millis++; 
    
    if(this.millis <= 9)
    {
      this.millisElem.innerHTML = "0" + this.millis;
    }
    
    if (this.millis > 9)
    {
      this.millisElem.innerHTML = this.millis;
    } 
    
    if (this.millis > 99) 
    {
      this.seconds++;
      this.millis = 0;
      this.secondsElem.innerHTML = "0" + this.seconds;
      this.millisElem.innerHTML = "0" + 0;
    }
    
    if (this.seconds > 9)
    {
      this.secondsElem.innerHTML = this.seconds;
    }
  }

  generate()
  {
    var mineCount = 0;
    for(var x = 0; x < this.cellCountX; x++)
    {
      this.cells[x] = {};
      for(var y = 0; y < this.cellCountY; y++)
      {
        var isMine = false;
        var prob = Math.random();

        if(prob >= 1 - (this.mineProb/100))
        {
          isMine = true;
          mineCount++;
        }

        this.cells[x][y] = new cell({ x: x, y: y, isMine: isMine, game: this});
      }
    }

    for(var x = 0; x < this.cellCountX; x++)
    {
      for(var y = 0; y < this.cellCountY; y++)
      {
        this.cells[x][y].getNeighborMineCount();
      }
    }

    this.mineCount = mineCount;
    this.keyListenerShouldBeActive = true;
    this.secondsElem.innerHTML = "00";
    this.millisElem.innerHTML = "00";
    this.startTimer();
    this.gameRunning = true;

    return { mineCount: mineCount, cellCount: this.cellCount() };
  }

  revealAllCells()
  {
    for(var x = 0; x < this.cellCountX; x++)
    {
      for(var y = 0; y < this.cellCountY; y++)
      {
        this.cells[x][y].reveal();
      }
    }
  }

  getElem()
  {
    var div = document.createElement("div");
    div.id = "grid";
    div.classList.add("grid");

    for(var y = 0; y < this.cellCountY; y++)
    {
      for(var x = 0; x < this.cellCountX; x++)
      {
        div.appendChild(this.cells[x][y].getElem());
      }
    }
    return div;
  }

  checkForWin()
  {
    if(!this.gameRunning) return;

    var notRevealed = this.cellCount() - document.getElementsByClassName("revealed").length;
    var markedMines = document.getElementsByClassName("marked");
    var allCorrectMarked = true;

    for(var i = 0; i < markedMines.length; i++)
    {
      var markedMine = markedMines[i];
      if(!markedMine.isMine)
      {
        allCorrectMarked = false;
      }
    }

    if(notRevealed == this.mineCount || (markedMines.length == this.mineCount && allCorrectMarked))
    {
      this.gamewon();
    }
  }

  setTableStyle()
  {
    document.getElementById("grid").style.gridTemplateColumns = "auto ".repeat(this.cellCountX);
    document.getElementById("grid").style.gridTemplateRows = "auto ".repeat(this.cellCountY);
  }

  endAll()
  {
    this.gameRunning = false;
    this.stopTimer();
    this.keyListenerShouldBeActive = false;
    this.revealAllCells();
  }

  gamewon()
  {
    this.endAll();
    this.info.showText("Victory!");
    alert("Victory!")
  }

  gameover(cell)
  {
    this.endAll();
    this.info.showText("Gameover! 👿");
  }
}

class gameinfo
{
  constructor()
  {
    this.elem = document.createElement("div");
    this.elem.innerHTML = "Pro tip: you can mark a square as a mine by holding <kbd>Ctrl</kbd> while clicking</br>Have fun 🖤";
  }

  getElem()
  {
    return this.elem;
  }

  showText(text)
  {
    this.elem.innerText = text;
  }

  showGamestats(stats)
  {
    this.elem.innerText = "There are " + stats.mineCount + " mines hidden in " + stats.cellCount + " squares, watch out! 💣";
  }
}


class cell 
{
  constructor(config) 
  {
    this.game = config.game;
    this.x = config.x;
    this.y = config.y;
    this.isMine = config.isMine;

    this.isRevealed = false;
    this.isMarked = false;
    this.neighborMineCount = -1;

    this.elem = document.createElement("div");
    this.elem.classList.add("grid_item");
    this.elem.addEventListener("click", this.cellWasClicked.bind(this));
  }

  cellWasClicked()
  {
    if (this.game.strgPressed && !this.isRevealed)
    {
      this.markAsBomb();
    }
    else if(!this.isMarked)
    {
      this.reveal();
    }
    this.game.checkForWin();
  }

  reveal()
  {
    if (this.isRevealed) return;
    this.isRevealed = true;
    if (this.isMine) 
    {
      if(this.isMarked)
      {
        this.elem.classList.add("foundmine");
      }
      else
      {
        this.elem.classList.add("mine");
      }
      this.elem.innerText = "💣";
      this.game.gameover(this);
    }
    else 
    {
      this.elem.classList.add("revealed");
      if(this.neighborMineCount > 0)
      {
        this.elem.innerText = this.neighborMineCount;
      }
      else
      {
        this.revealNeighbors();
      }
    }
  }

  getNeighborMineCount()
  {
    var cnt = 0;
    for(var ix = -1; ix < 2; ix++)
    {
      for(var iy = -1; iy < 2; iy++)
      {
        if(ix == 0 && iy == 0) continue;
        var _x = ix + this.x;
        var _y = iy + this.y;
        if(_x < 0) continue;
        if(_y < 0) continue;
        if(_x >= this.game.cellCountX) continue;
        if(_y >= this.game.cellCountY) continue;

        var cell = this.game.cells[_x][_y];
        if(cell.isMine)
        {
          cnt++;
        }
      }
    }
    this.neighborMineCount = cnt;
  }

  revealNeighbors()
  {
    for(var ix = -1; ix < 2; ix++)
    {
      for(var iy = -1; iy < 2; iy++)
      {
        if(ix == 0 && iy == 0) continue;
        var _x = ix + this.x;
        var _y = iy + this.y;
        if(_x < 0) continue;
        if(_y < 0) continue;
        if(_x >= this.game.cellCountX) continue;
        if(_y >= this.game.cellCountY) continue;

        var cell = this.game.cells[_x][_y];
        cell.reveal();
      }
    }
  }

  markAsBomb()
  {
    this.isMarked ^= true;
    if(this.isMarked) 
    {
      this.oldText = this.elem.innerText;
      this.elem.classList.add("marked");
      this.elem.innerText = "🚩";
    }
    else 
    {
      this.elem.classList.remove("marked");
      this.elem.innerText = this.oldText;
    }
  }

  getElem()
  {
    return this.elem;
  }
}

class minesweeperConfig
{
  cellCountXLabelElem;
  cellCountXElem;
  cellCountYLabelElem;
  cellCountYElem;
  mineProbLabelElem;
  mineProbElem;
  mineProbPrefixLabelElem;
  timerLabelElem;
 
  get x()
  {
    return this.cellCountXElem.value;
  }

  get y()
  {
    return this.cellCountYElem.value;
  }

  get mineProb()
  {
    return this.mineProbElem.value;
  }

  constructor()
  {
    this.buildElems();
  }

  buildElems()
  {
    var numInputStyle = "width: 50px; font-size: 16px; padding-left: 6px; background-color: #212121; color: #d6d6d6; border:0px";
    var labelStyle = "padding: 2px; margin-left:10px; margin-right:4px";
    var prefixStyle = "padding: 2px; margin-right:10px;";
    
    var eXL = document.createElement("div");
    eXL.innerText = "➡";
    eXL.style = labelStyle;
    this.cellCountXLabelElem = eXL;

    var eX = document.createElement("input");
    eX.type = "number";
    eX.min = "10";
    eX.max = "60";
    eX.step = "1"
    eX.value = "30";
    eX.style = numInputStyle;
    eX.onkeyup = function() { enforceMinMax(eX); }.bind(this);
    this.cellCountXElem = eX;

    var eYL = document.createElement("div");
    eYL.innerText = "⬆";
    eYL.style = labelStyle;
    this.cellCountYLabelElem = eYL;

    var eY = document.createElement("input");
    eY.type = "number";
    eY.min = "10";
    eY.max = "60";
    eY.step = "1"
    eY.value = "30";
    eY.style = numInputStyle;
    eY.onkeyup = function () { enforceMinMax(eY); }.bind(this);
    this.cellCountYElem = eY;

    var ePL = document.createElement("div");
    ePL.innerText = "💣❓";
    ePL.style = labelStyle;
    this.mineProbLabelElem = ePL;

    var eTL = document.createElement("div");
    eTL.innerText = "⏰";
    eTL.style = labelStyle;
    this.timerLabelElem = eTL;

    var ePpref = document.createElement("div");
    ePpref.innerText = "%";
    ePpref.style = prefixStyle;
    this.mineProbPrefixLabelElem = ePpref;

    var eP = document.createElement("input");
    eP.type = "number";
    eP.min = "3";
    eP.max = "50";
    eP.step = "1"
    eP.value = "10";
    eP.style = numInputStyle;
    eP.onkeyup = function () { enforceMinMax(eP); }.bind(this);
    this.mineProbElem = eP;

    var eT = document.createElement("div");
    var eTs = document.createElement("div");
    var eTd = document.createElement("div");
    var eTm = document.createElement("div");

    eTs.id = "statSeconds";
    eTs.innerText = "00";
    eTd.innerText = ".";
    eTm.id = "statMillis";
    eTm.innerText = "00";

    eT.style = "display: flex; " + prefixStyle;
    eT.appendChild(eTs);
    eT.appendChild(eTd);
    eT.appendChild(eTm);
                                           
    this.timerElem = eT;
  }

  getElems()
  {
    return [
      this.cellCountXLabelElem, 
      this.cellCountXElem, 
      this.cellCountYLabelElem, 
      this.cellCountYElem, 
      this.mineProbLabelElem, 
      this.mineProbElem,
      this.mineProbPrefixLabelElem,
      this.timerLabelElem,
      this.timerElem
    ]
  }
}

function enforceMinMax(el) 
{
  if (el.value != "") 
  {
    if (parseInt(el.value) < parseInt(el.min)) 
    {
      el.value = el.min;
    }

    if (parseInt(el.value) > parseInt(el.max)) 
    {
      el.value = el.max;
    }
  }
}