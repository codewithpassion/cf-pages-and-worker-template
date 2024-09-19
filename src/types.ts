export type HonoAppType = {
    Bindings: {
      HEIMDALL_BUCKET: R2Bucket
    }, 
    Env: {}
}


export type User = {
    name: string;
    email: string;
}

export type Project = { 
    name: string;
    description: string;
    admins: User[];
    members: User[];
}