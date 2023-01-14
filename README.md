# Scavenger Hunt AR experience



Game mechanics are simple. Users will be encouraged to look for hidden pictures that will launch the experience through an embedded QR Code. Once the experience loads:

1. The first time it will require users to register.
2. The camera will be displayed so users can scan the marker image.
3. Once the marker is detected, a 3D coin will be shown.
4. Tapping on the coin will catch it and increase the score.

## Preview

[![preview video](https://img.youtube.com/vi/vtFYV-3ONxo/0.jpg)](https://www.youtube.com/watch?v=vtFYV-3ONxo "Onirix Scavenger Hunt")

## Test it!

You can test the experience by scanning the embedded QR Code of any of the following game pictures:

- [Blue coin](https://scavenger-hunt.onirix.com/sh-blue.png) - 125 pts
- [Red coin](https://scavenger-hunt.onirix.com/sh-red.png) - 250 pts
- [Gold coin](https://scavenger-hunt.onirix.com/sh-gold.png) - 500 pts

## Develop you own

This project was developed with [Angular](https://angular.io/). However, feel free to use any other framework or module bundler.

>As this project is just a sample, we've used browser's local storage as a backend. If you plan to develop your own version and make it publicly available, we suggest you to use a real database or a cloud backend provider like [Firebase](https://firebase.google.com/). 

Its structure consists of three main components:

* **GameComponent**: It is the main entry once the user access through a QR Code. If user is not registered it will be redirected to the *register component*, otherwise it will display the AR experience.

* **RegisterComponent**: It represents a simple register form.

* **ScoreComponent**: This component will load every time a coin is cached, displaying the score.

There is also a *header component* shared by the three components above.

### Game Component

When this component loads it shows a brief explanation of the game:

- Each coin has a different colour and a different score.
- Catching several coins will contribute to increase the overall score.
- Coins already catched won't generate new points.

After that, the camera will show up and a coin will appear once a game image is detected.

The coin that is rendered depends on the parameters sent in the URL. You can tweak coin points and colors from *constants.ts* file. 

### Register Component

This component uses the *ReactiveFormsModule* to evaluate form's validity (all fields are required, the email must have a valid email format and terms must be accepted).

### Score Component

This component checks game variables from local storage to **display the score**. 

If the coin has already been collected, points will not be added to the score. Otherwise, the total score will be increased.
