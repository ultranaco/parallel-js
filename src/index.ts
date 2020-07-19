
/**
 * Spread concurrent tasks or promises
 */
export class Parallel {
  /**
   * represents whether still processing tasks or actions
   */
  public isAlive: boolean;
  /**
   * task counter to represent actions executing
   */
  public tasks: number;
  
  private _bouncer: PromiseResolver; 
  private _drain: Promise<void>;
  private _drainResolver: PromiseResolver;
  private _isDraining: boolean;
  
  constructor(private _parallelDeggree: number){
    this.isAlive = true;
    this.tasks = 0;
    this._isDraining = false;
    
    this._bouncer = ()=>{};
    this._drainResolver = ()=>{};

    this._drain = new Promise((resolver)=>{
      this._drainResolver = resolver;
    });
  }

  /**
   * 
   * @param action function to execute in parallel
   * @param parameters object to send as parameter in action function when is invoked
   */
  public async exec<T>(action: (n: T) => Promise<void>, parameters: T): Promise<void> {
    await this.pause();
    action(parameters).then(()=>{
      this.release();
    }).catch((error)=>{
      this.release();
      throw error;
    });
  }

  /**
   * wait for all tasks to finish on the main thread
   */
  public async wait(): Promise<void> {
    this._isDraining = true;
    await this._drain;
    this.isAlive = false;
  }
  
  private async pause(): Promise<void> {
    return new Promise((bouncer) => {
      this.tasks ++;
      if (this.tasks <= this._parallelDeggree) {
        bouncer();
      } else {
        this._bouncer = bouncer;
      }
    });
  }

  private release(): void {
    const bouncer: PromiseResolver = this._bouncer;
    this._bouncer = ()=>{};
    this.tasks --;
    bouncer();

    if(this._isDraining){
        if(this.tasks <= 0){
          this._drainResolver();
        }
    }
  }
}

export type PromiseResolver = (value?: void | Promise<void> | undefined) => void ;
export type PromiseReject = (reason?: any) => void;