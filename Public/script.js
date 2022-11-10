socket = io();
let username;
let leaderboard;
let match;
let opponent;

socket.on('loggedIn', function (newUsername){
  username = newUsername;
  
  document.getElementById('loginContainer').style.visibility = 'hidden';
  document.getElementById('content').style.visibility = 'visible';
});

socket.on('leaderboardUpdate', function (newLeaderboard){
  leaderboard = newLeaderboard;

  console.log('New leaderboard:');
  console.log(leaderboard);
  
  updateLeaderboard();
});

socket.on('joinedMatch', function (newMatch){
  match = newMatch;

  const opponentElem = document.getElementById('opponent');
  opponent = (match.players[0].username != username)? match.players[0].username : match.players[1].username;
  opponentElem.innerText = `Opponent: ${opponent}`;
  opponentElem.style.visibility = 'visible';

  document.getElementById('waitingContainer').style.visibility = 'hidden';
  document.getElementById('newGame').style.visibility = 'hidden';
  updateBoard(match.board);
  displayTurn();
  
  console.log('Match joined:');
  console.log(match);
});

socket.on('matchUpdate', function (newMatch){
  match = newMatch;

  updateBoard(match.board);
  displayTurn();
  
  console.log('Match updated:');
  console.log(match);
});

socket.on('gameWon', function (winObj){
  match = winObj.match;

  updateBoard(match.board);
  document.getElementById('turn').innerText = `Winner: ${winObj.winner}!`;
  document.getElementById('newGame').style.visibility = 'visible';
  
  console.log('Game finished:');
  console.log(winObj);
});

socket.on('catsGame', function (newMatch){
  match = newMatch;

  updateBoard(match.board);
  document.getElementById('turn').innerText = 'Cat\'s game.';
  document.getElementById('newGame').style.visibility = 'visible';
  
  console.log('Cat\'s game:');
  console.log(winObj);
});

socket.on('opponentDisconnect', function (){
  document.getElementById('turn').innerText = 'Opponent disconnected.';
  document.getElementById('newGame').style.visibility = 'visible';
  document.getElementById('opponent').style.visibility = 'hidden';
  
  console.log('Opponent disconnected.');
});

function updateBoard(board){
  const squares = document.getElementById('gameBoard').children;
    
  for(let square in squares){
    squares[square].innerText = board[square];
  }
}

function playTurn(square){
  if(match.players[match.turn].username != username) return;
  if(match.board[square] != '') return;
  
  const move = {
    match: match,
    square: square
  }
  
  socket.emit('playTurn', move);
}

function displayTurn(){
  let text = `${match.players[match.turn].username}'s turn.`;

  if(match.players[match.turn].username == username) text = 'Your turn!';
  
  document.getElementById('turn').innerText = text;
}

function updateLeaderboard(){
  if(leaderboard.length < 1) return;
  
  const places = document.getElementById('leaderboard').getElementsByTagName('li');
  
  for(let place in places){
    const player = leaderboard[place];
    if(player){
      places[place].innerText = `${player.username}: ${formatNumber(player.score)}`;
    }
  }
}

function formatNumber(number){
  if(number){
    return(number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
  } else {
    return(number);
  }
}

document.onclick = function(event) {
  if(event.isTrusted == false) window.reload();
}

function joinQueue(){
  document.getElementById('waitingContainer').style.visibility = 'visible';
  document.getElementById('turn').innerText = '';
  document.getElementById('opponent').style.visibility = 'hidden';
  document.getElementById('newGame').style.visibility = 'hidden';
  
  socket.emit('joinQueue');
}