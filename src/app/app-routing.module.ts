import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { RegisterComponent } from './register/register.component';
import { ScoreComponent } from './score/score.component';

const routes: Routes = [
  {
    path: 'game/:id',
    component: GameComponent
  },
  {
    path: 'score/:id',
    component: ScoreComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: '**',
    redirectTo: 'register'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
