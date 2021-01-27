import { ComponentType } from "react";
import IndexPage from "./IndexPage";
import LoginPage from "./LoginPage";
import BigClassPage from "./pages/BigClassPage";
import ScheduleRoomDetailPage from "./pages/ScheduleRoomPage";
import SmallClassPage from "./pages/SmallClassPage";
import ReplayPage from "./ReplayPage";
import RoomDetailPage from "./RoomDetailPage";
import UserIndexPage from "./UserIndexPage";
import UserInfoPage from "./UserInfoPage";
import UserScheduledPage from "./UserScheduledPage";
import UserSettingPage from "./pages/UserSettingPanel";

export enum RouteNameType {
    IndexPage = "IndexPage",
    LoginPage = "LoginPage",
    UserIndexPage = "UserIndexPage",
    SmallClassPage = "SmallClassPage",
    BigClassPage = "BigClassPage",
    RoomDetailPage = "RoomDetailPage",
    UserScheduledPage = "UserScheduledPage",
    ScheduleRoomDetailPage = "ScheduleRoomDetailPage",
    UserInfoPage = "UserInfoPage",
    UserSettingPage = "UserSettingPage",
    ReplayPage = "ReplayPage",
}

export const routeConfig = {
    [RouteNameType.IndexPage]: {
        title: "Flat",
        path: "/",
        component: IndexPage,
    },
    [RouteNameType.LoginPage]: {
        title: "Flat Login",
        path: "/login/",
        component: LoginPage,
    },
    [RouteNameType.UserIndexPage]: {
        title: "Flat",
        path: "/user/",
        component: UserIndexPage,
    },
    [RouteNameType.SmallClassPage]: {
        title: "Flat Small Class",
        path: "/classroom/SmallClass/:roomUUID/:ownerUUID/",
        component: SmallClassPage,
    },
    [RouteNameType.BigClassPage]: {
        title: "Flat Big Class",
        path: "/classroom/BigClass/:roomUUID/:ownerUUID/",
        component: BigClassPage,
    },
    [RouteNameType.RoomDetailPage]: {
        title: "Flat Room Detail",
        path: "/user/room/",
        component: RoomDetailPage,
    },
    [RouteNameType.UserScheduledPage]: {
        title: "Flat Schedule Room",
        path: "/user/scheduled/",
        component: UserScheduledPage,
    },
    [RouteNameType.ScheduleRoomDetailPage]: {
        title: "Flat Scheduled Room Detail",
        path: "/user/scheduled/info/",
        component: ScheduleRoomDetailPage,
    },
    [RouteNameType.UserInfoPage]: {
        title: "Flat Info",
        path: "/info/",
        component: UserInfoPage,
    },
    [RouteNameType.UserSettingPage]: {
        title: "Flat Setting",
        path: "/setting/",
        component: UserSettingPage,
    },
    [RouteNameType.ReplayPage]: {
        title: "Flat Replay",
        path: "/replay/:roomUUID/:ownerUUID/",
        component: ReplayPage,
    },
} as const;

type CheckRouteConfig<
    T extends {
        [name in RouteNameType]: {
            title: string;
            path: string;
            component: ComponentType<any>;
        };
    }
> = T;

export type RouteConfig = CheckRouteConfig<typeof routeConfig>;