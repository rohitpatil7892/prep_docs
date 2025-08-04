function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const user = { name: 'Rohit' };
greet.call(user, 'Hi', '!'); 

greet.apply(user, ['Hello', '...']);  

const excitedHi = greet.bind(user, 'Hey');
excitedHi('!!!'); 