# nestjs-cloud-logging

xtended default NestJS logger with Winston transporter for Google Cloud Logging.

```typescript
// app.module.ts

@Module({
    imports: [
        WinstonLoggerModule.forRoot({
            isGlobal: true,
            projectId: "google-cloud-project-id",
            keyFilename: "path-to-key-filename",
        }),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
}
```

```typescript
// main.ts

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useLogger(app.get(WinstonLoggerServiceApp));

    await app.listen(3000);
}

bootstrap();
```
