function DoublesidedList(config)
{
    this.config = config;
    this.initElements();
}

DoublesidedList.prototype.initElements = function()
{
    var rootDiv = document.createElement("div");
    rootDiv.style = this.config.rootDivStyle ?? "display: flex; flex-direction: row;";
    var id = this.config.id ?? "doubleSidedList";
    rootDiv.id = id;
    this.rootElemId = id;

    var buttonDiv = document.createElement("div");
    buttonDiv.style = this.config.buttonDivStyle ?? "display: flex; flex-direction: column;";

    var moveToBButton = document.createElement("button");
    moveToBButton.innerText = "->";
    moveToBButton.addEventListener("click", this.moveToB);

    var moveToAButton = document.createElement("button");
    moveToAButton.innerText = "<-";

    var lista = document.createElement("select");
    lista.id = "lista";
    lista.style = "width: 100px;";
    lista.multiple = true;

    var listb = document.createElement("select");
    listb.id = "listb";
    listb.style = "width: 100px;";
    listb.multiple = true;

    for(var i = 0; i < this.config.startOptions.length; i++)
    {
        lista.options.add(this.config.startOptions[i]);
    }

    buttonDiv.appendChild(moveToBButton);
    buttonDiv.appendChild(moveToAButton);

    rootDiv.appendChild(lista);
    rootDiv.appendChild(buttonDiv);
    rootDiv.appendChild(listb);

    this.elements = rootDiv;
    this.lista = lista;
    this.listb = listb;
}

DoublesidedList.prototype.moveToB = function()
{
    for(var i = 0; i < this.lista.selectedOptions.length; i++)
    {
        var opt = this.lista.selectedOptions[i];
        this.listb.options.add(opt);
        this.lista.options.remove(opt);
    }
}

var obj = new DoublesidedList({ 
    startOptions: [ "Test1", "Test2", "Test3" ],
    rootDivStyle: null,
    buttonDivStyle: null,
});

document.getElementById("listcontainer").appendChild(obj.elements);
console.log("test");


