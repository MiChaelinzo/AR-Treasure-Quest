import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { points, colorStrings } from '../../constants';

@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ScoreComponent implements OnInit {

  coinId!: string;
  score: number = 0;
  coinColor!: string;
  repeated: boolean = false;
  text: string = "";
  paragraph: string = "";
  pointsAdded: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.coinId = this.route.snapshot.params.id;
    this.coinColor = colorStrings.get(this.coinId)!;
    if (localStorage.getItem('score')) {
      this.score = parseInt(localStorage.getItem('score')!);
    }
    // Update score
    if (localStorage.getItem(this.coinId)) {
      this.text = "Coin already catched!";
      this.paragraph = "This coin was already catched. Look for others to increase your score.";
      this.pointsAdded = 0;
      this.repeated = true;
    } else {
      this.pointsAdded = points.get(this.coinId)!;
      this.score += this.pointsAdded;
      localStorage.setItem('score', this.score.toString());
      localStorage.setItem(this.coinId, 'true');
      this.text = `You've caught a ${this.coinColor} coin!`;
      this.paragraph = "New points have been added to your total score. Keep playing to get more."; 
    }
  }

}
