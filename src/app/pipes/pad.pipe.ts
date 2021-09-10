import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pad'
})
export class PadPipe implements PipeTransform {

  transform(value: number | string): string {
    let s = value+'';
    while (s.length < 2)
      s = '0' + s;
    return s;
  }

}
