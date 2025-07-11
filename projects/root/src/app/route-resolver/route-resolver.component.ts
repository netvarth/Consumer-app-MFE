import { Component, OnInit } from '@angular/core';
import { SkeletonLoadingModule } from 'jconsumer-shared';

@Component({
  selector: 'app-route-resolver',
  standalone: true,
  imports: [SkeletonLoadingModule],
  templateUrl: './route-resolver.component.html',
  styleUrls: ['./route-resolver.component.css']
})
export class RouteResolverComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
