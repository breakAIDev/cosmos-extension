import { Env, MessageSender } from './types';

export abstract class Message<R> {
  
  
  protected _: R;
  abstract validateBasic(): void;
  abstract type(): string;
  public readonly origin!: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  approveExternal(_env: Omit<Env, 'requestInteraction'>, _sender: MessageSender): boolean {
    return false;
  }
}
