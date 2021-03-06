import React from "react";
import "./MainRoomHistory.less";
import emptyBoxSVG from "../assets/image/empty-box.svg";
import { FlatServerRoom } from "../apiMiddleware/flatServer";
import { isSameDay } from "date-fns";
import MainRoomHistoryItem from "./MainRoomHistoryItem";

export type MainRoomHistoryProps = {
    rooms: FlatServerRoom[];
    historyPush: (path: string) => void;
};

export class MainRoomHistory extends React.Component<MainRoomHistoryProps> {
    public renderRooms(): JSX.Element | JSX.Element[] {
        const { rooms } = this.props;
        if (rooms.length === 0) {
            return (
                <div className="room-empty-box">
                    <img src={emptyBoxSVG} alt={"emptyBoxSVG"} />
                    <span>暂无预约课程</span>
                </div>
            );
        }

        let lastOne: FlatServerRoom | null = null;
        return rooms.map(room => {
            const showDate =
                !lastOne || !isSameDay(new Date(room.beginTime), new Date(lastOne.beginTime));
            lastOne = room;
            return (
                <MainRoomHistoryItem
                    key={room.roomUUID}
                    room={room}
                    showDate={showDate}
                    historyPush={this.props.historyPush}
                />
            );
        });
    }

    public render(): JSX.Element {
        return (
            <div className="room-list-container">
                <div className="room-list-header">
                    <div>
                        <span className="room-list-title">历史记录</span>
                    </div>
                </div>
                <div className="room-list-line" />
                <div className="room-list-body">{this.renderRooms()}</div>
            </div>
        );
    }
}
