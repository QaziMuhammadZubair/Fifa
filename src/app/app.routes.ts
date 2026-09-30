import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MatchesComponent } from './components/matches/matches.component';
import { LiveStreamComponent } from './components/live-stream/live-stream.component';
import { SimulatorComponent } from './components/simulator/simulator.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'matches', component: MatchesComponent },
  { path: 'live', component: LiveStreamComponent },
  { path: 'simulator', component: SimulatorComponent },
  { path: '**', redirectTo: '' },
];
