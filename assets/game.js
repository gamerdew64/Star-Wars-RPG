// This code will need to be executed when the DOM has fully loaded
$(document).ready(function()
{
  // This function controls the timeing and fade of our loading gif
  $("#loader").delay(5000).fadeOut("fast");

  // Sound Clips - Attack, Defend, and End Music
  // Attack sounds
  var lightsaberAttackCharacter = new Audio("assets/sounds/lightsaberAttackCharacter.mp3");
  var lightsaberAttackByDefender = new Audio("assets/sounds/lightsaberAttackByDefender.mp3");
  // Sound that plays when an opponent is defeated
  var beatOpponent = new Audio("assets/sounds/victoryChime.mp3");
  // Sound that plays when the chosen player loses the game
  var loseTheme = new Audio("assets/sounds/starWarsDefeatMusic.mp3");
  // Sound that plays when the chosen player wins the game
  var winTheme = new Audio("assets/sounds/starWarsVictoryMusic.mp3");

  var characters =
  {
    //Base stats for Obi-Wan Kenobi
    "Obi-Wan Kenobi":
    {
      name:"Obi-Wan Kenobi",
      health:120,
      attack:8,
      imageUrl: "assets/images/obiWan.jpeg",
      enemyRetaliate:15
    },
    //Base stats for Luke Skywalker
    "Luke Skywalker":
    {
      name:"Luke Skywalker",
      health:100,
      attack:14,
      imageUrl: "assets/images/lukeSkywalker.jpeg",
      enemyRetaliate:5
    },
    //Base stats for Darth Sidious
    "Darth Sidious":
    {
      name:"Darth Sidious",
      health:150,
      attack:8,
      imageUrl: "assets/images/darthSidious.jpg",
      enemyRetaliate:5
    },
    //Base stats for Darth Maul
    "Darth Maul":
    {
      name:"Darth Maul",
      health:180,
      attack:7,
      imageUrl: "assets/images/darthMaul.png",
      enemyRetaliate:25
    }
  };

  // This will populate when the player selects the character.
  var playableCharacter;
  // This will populate with all of the characters that the player didn't select.
  var fighters = [];
  // This will populate when the player chooses an opponent.
  var currentDefender;
  // This will keep track of our turns during combat and will be used for calculating damage.
  var turnDamageCounter=1;
  //Tracks number of defeated opponents.
  var killCount=0;
  // This will console log out the character's base info and stats to the console. Commenting out.
  // console.log(characters)

  // This function will render a character div to the page.
  // The character rendered and the area to which they are rendered.
  var showCharacter = function(character, showArea, characterStatus)
  {
    var characterDiv = $("<div class='character' dataName='" + character.name + "'>");
    // This will be the name displayed at the top of the div
    var characterName = $("<div class='characterName'>").text(character.name);
    // Image to be displayed within the object
    var characterImage = $("<img alt='image' class='characterImage'>").attr("src", character.imageUrl);
    // Health of each character that is displayed within the object
    var characterHealth = $("<div class='characterHealth'>").text(character.health);
    characterDiv.append(characterName).append(characterImage).append(characterHealth);
    $(showArea).append(characterDiv);

    // If the character is an enemy or defender (the active opponent), add the appropriate class
    if(characterStatus === "enemy")
    {
      $(characterDiv).addClass("enemy");
    }
    else if (characterStatus === "defender")
    {
      //Populate currentDefender with the selected opponent's information.
      currentDefender = character;
      $(characterDiv).addClass("enemyTarget");
    }
  };

  // Function that handles game messages
  var showMessage = function(message)
  {
    // This creates the message and appends it to the page.
    var gameMessageSet = $("#gameMessage");
    var newMessage = $("<div>").text(message);
    gameMessageSet.append(newMessage);

    // If we get this specific message passed in, clear the message area.
    if (message === "clearMessage")
    {
      gameMessageSet.text("");
    }
  };

  // Rendering objects to the page (rather than just the console)
  // This function renders characters based on which area they need to be rendered in
  var showMultipleCharacters = function(charObj, areaRender)
  {
    // "#characterSelectionSection" is the div where all the characters begin
    // If this is true, then all characters will render to the starting area
    if (areaRender === "#characterSelectionSection")
    {
      $(areaRender).empty();
      // Loop through the characers object and call the showCharacter function on each character to render their card
      for (var key in charObj)
      {
        if(charObj.hasOwnProperty(key))
        {
          showCharacter(charObj[key], areaRender, "");
        }
      }
    }

    // "#selectedCharacter" is the div in which the selected character appears.
    // If this is true, we will need to render the selected character here.
    if (areaRender === "#selectedCharacter")
    {
      showCharacter(charObj, areaRender, "");
    }

    // "#currentEnemies" is the div where our "inactive" opponents will reside
    // If true, we will need to render the selected character here.
    if (areaRender === "#currentEnemies")
    {
      // Loop through the fighters array and call the showCharacter function to each character
      for(var i=0; i < charObj.length; i++)
      {
        showCharacter(charObj[i], areaRender, "enemy");
      }

      // Creating on click events for each enemy
      $(document).on("click", ".enemy", function()
      {
        var name = ($(this).attr("dataName"));

        //If there is no defender, the clicked enemy will become the defender.
        if ($("#defender").children().length === 0)
        {
          showMultipleCharacters(name, "#defender");
          $(this).hide();
          showMessage("clearMessage");
        }
      });
    }

    // "#defender" is the div where the adtive opponent appears.
    // If true, render the selected enemy in this location.
    if(areaRender === "#defender")
    {
      // Emptying the "#defender" div so that nothing is in there (so we won't get different results).
      $(areaRender).empty();
      // Match the combatant that has the same name as the selected object (described by the above on-click function)
      for (var i=0; i<fighters.length; i++)
      {
        if(fighters[i].name === charObj)
        {
          showCharacter(fighters[i], areaRender, "defender");
        }
      }
    }

    // Need to re-render the defender div, otherwise both the old health amount and the new health amount will show
    // Re-render defender when attacked
    if (areaRender === "playerDamage")
    {
      $("#defender").empty();
      showCharacter(charObj, "#defender", "defender");
      lightsaberAttackCharacter.play();
    }

    // Re-render player character when attacked
    if (areaRender === "enemyDamage")
    {
      $("#selectedCharacter").empty();
      showCharacter(charObj, "#selectedCharacter", "");
      lightsaberAttackByDefender.play();
    }

    // Remove the defeated enemy from the game
    if (areaRender === "enemyDefeated")
    {
        $("#defender").empty();
        var gameStateMessage = ("You have defeated " + charObj.name + ", you can choose to fight another enemy, if you so desire.");
        showMessage(gameStateMessage);
        beatOpponent.play();
    }
  };

  // Function that restarts the game after victory or defeat.
  var restartGame = function(inputEndGame)
  {
    //When the "restart" button is clicked, reload the page.
    var restart = $("<button>Restart</button>").click(function()
    {
      location.reload();
    });

    // Create a div that will display the victory or defeat messages
    var gameState = $("<div>").text(inputEndGame);

    // Render the restart button and vicotry or defeat message to the page
    $("body").append(gameState);
    $("body").append(restart);
  };

  // Render all the characters to the page when the game starts.
  showMultipleCharacters(characters, "#characterSelectionSection");
  $(document).on("click", ".character", function()
  {
    // console.log("Click is Successful!");

    // This will save the clicked character's name
    var name = $(this).attr("dataName");
    console.log(name);

    // If a user has not yet selected a character, do this:
    if (!playableCharacter)
    {
      // We populate playableCharacter with the selected character's information
      playableCharacter = characters[name];
      // Loop through the remaining characters, and push them to to the fighters array
      for (var key in characters)
      {
        if (key !== name)
        {
          fighters.push(characters[key]);
        }
      }
      //This should show all the objects except the one that was chosen.
      // console.log(fighters);

      //Render characters to new section and hide the character select div
      $("#characterSelectionSection").hide();
      showMultipleCharacters(playableCharacter, "#selectedCharacter");
      showMultipleCharacters(fighters, "#currentEnemies");
    }
  });

  // This is the game logic that occurs after the attack button has been clicked.
  $("#attackButton").on("click", function()
  {
    if ($("#defender").children().length !==0)
    {

      // Creates messages for our attack and our opponents counter attack.
      var attackMessage = ("You attacked " + currentDefender.name + " for " + (playableCharacter.attack * turnDamageCounter) + " damage.");
      var counterAttackMessage = (currentDefender.name + " attacked you back for " + currentDefender.enemyRetaliate + " damage.");
      showMessage("clearMessage");

      // Reduce defender's health and attack value.
      // The "-=" is a shortcut for updating the variable on the left ("currentDefender.health") equal to the variable on the right subtracted from the variable on the left ("currentDefender.health")
      currentDefender.health -= (playableCharacter.attack * turnDamageCounter);

      // If the opponent still has health, do this:
      if (currentDefender.health>0)
      {
        // Show the opponent's updated card.
        showMultipleCharacters(currentDefender, "playerDamage");

        // Render the combat messages.
        showMessage(attackMessage);
        showMessage(counterAttackMessage);

        // Reduce your health by the opponent's attack value.
        playableCharacter.health -= currentDefender.enemyRetaliate;

        // Render the player's updated character card.
        showMultipleCharacters(playableCharacter, "enemyDamage");

        //If you have less than zero health, the game ends. We call the restartGame function here.
        if (playableCharacter.health<=0)
        {
          showMessage("clearMessage");
          restartGame("You have been defeated. Please try again!");
          loseTheme.play();
          $("#attackButton").unbind("click");
        }
      }

      // If the enemy has less than zero health, they are defeated
      else
      {
        // Remove the opponent's card
        showMultipleCharacters(currentDefender, "enemyDefeated");
        // Increment the killCount here.
        killCount++;
        // If you kill all the opponents, you win.
        // Since there are only three opponents, we can just add an if statement that looks to see iff the kill count is >= 3. If so, generate winning message.
        // Call the restartGame function here.
        if (killCount>=3)
        {
          showMessage("clearMessage");
          restartGame("You Won! The Force is Strong With You!");
          winTheme.play();
        }
      }
    }
    turnDamageCounter++;
  });
});
