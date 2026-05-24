export class CreateBookingDto {
  restaurantId: number;
  date: string;
  time: string;
  guests: number;
  note?: string;
}
