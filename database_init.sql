
CREATE DATABASE auth_test
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

    
CREATE TABLE public.session
(
    sid character varying COLLATE pg_catalog."default" NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL,
    CONSTRAINT session_pkey PRIMARY KEY (sid)
)

TABLESPACE pg_default;

ALTER TABLE public.session
    OWNER to postgres;
-- Index: IDX_session_expire

-- DROP INDEX public."IDX_session_expire";

CREATE INDEX "IDX_session_expire"
    ON public.session USING btree
    (expire ASC NULLS LAST)
    TABLESPACE pg_default;


    
CREATE TABLE public.users
(
    id bigint NOT NULL,
    email text COLLATE pg_catalog."default" NOT NULL,
    password text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.users
    OWNER to postgres;

insert into users (id, email, password) values(1, 'me@server.com', '$2b$10$SGdMaMjyqUztx4vkR5OT.OuN0pOU6N/P.hLQkWagEuW7OeyoifeT6');