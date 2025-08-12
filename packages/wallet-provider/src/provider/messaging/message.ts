import { Env, MessageSender } from './types';

export abstract class Message<R> {
  protected declare _: R;
  
  abstract validateBasic(): void;
  abstract type(): string;
  public readonly origin!: string;

  approveExternal(_env: Omit<Env, 'requestInteraction'>, _sender: MessageSender): boolean {
    return false;
  }
}
