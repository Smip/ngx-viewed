import {Component, OnInit} from '@angular/core';

interface Block {
  tick: { id: any, time: number };
  visible: boolean;
  viewed: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  blocks: Block[] = [];

  ngOnInit(): void {
    [...Array(10).keys()].forEach(() => {
      this.blocks.push({
        tick: null,
        visible: false,
        viewed: false,
      });
    });
  }

}
