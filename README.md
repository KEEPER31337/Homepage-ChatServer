# Chat-Server

## env 설정

```
API_URL=API_URL:port
DB_user=[]
DB_password=[]
```

프로젝트 디렉토리에 위와 같이 **.env** 파일 작성

- API SERVER 주소 설정

## DB 구축

```shell
docker run --name [container name] -p 3306:3306 -e MYSQL_ROOT_PASSWORD=[password] -d mysql:8.0
```

### Database 생성

```shell
npm run db:createDB
```

### Migration 적용
```shell
npm run db:migrate
```

### Migration 추가

```shell
npx babel-node src/db/migration.js add migration [migration_name]
```